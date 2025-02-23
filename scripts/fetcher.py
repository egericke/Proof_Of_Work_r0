# scripts/fetcher.py
from datetime import datetime, timedelta
import logging
from typing import List

import pytz  # For timezone awareness
from psycopg2.extensions import connection
from garminconnect import Garmin

import scripts.config as config
from scripts.database import get_last_successful_fetch_date

logger = logging.getLogger(__name__)

def fetch_garmin_daily(conn: connection) -> List[dict]:
    """
    Fetch Garmin activities since the last successful fetch or a default period (e.g. 7-30 days).
    This version accounts for potential end-date exclusivity, time zone mismatches, and sync delays
    by extending the date range and introducing a fallback fetch if no data is returned.
    """

    try:
        # 1. Check Credentials
        username = config.GARMIN_USERNAME
        password = config.GARMIN_PASSWORD
        if not username or not password:
            logger.error("Garmin credentials not found.")
            return []

        # 2. Log into Garmin Connect
        client = Garmin(username, password)
        client.login()
        logger.info("Successfully logged into Garmin Connect.")

        # 3. Determine Date Range
        #    Use UTC to avoid time zone confusion, or local if you know Garmin's exact timezone
        utc = pytz.UTC
        now_utc = datetime.now(utc)

        # Retrieve last fetch date from DB, or default 7-30 days back
        last_fetch = get_last_successful_fetch_date(conn)
        if last_fetch:
            # If last_fetch is naive, convert it to UTC. Otherwise ensure it's properly tz-aware.
            if last_fetch.tzinfo is None:
                last_fetch = utc.localize(last_fetch)
            start_date = last_fetch.date()
        else:
            # Default to 7 days or 30 days—your preference
            start_date = (now_utc - timedelta(days=7)).date()

        # Extend end_date by 1 day to handle exclusive range or same-day fetch
        end_date = (now_utc + timedelta(days=1)).date()

        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        logger.info(f"Fetching activities from {start_date_str} to {end_date_str}")

        # 4. Fetch Activities from Garmin API
        activities = client.get_activities_by_date(start_date_str, end_date_str)
        logger.info(f"API returned {len(activities)} activities.")

        # Log sample activity data for diagnostics
        for i, activity in enumerate(activities[:3]):
            logger.debug(f"Sample Activity {i+1} startTimeLocal: {activity.get('startTimeLocal', 'N/A')}")

        # 5. Fallback if no activities found
        if not activities:
            logger.warning("No activities in date range. Attempting fallback to recent activities.")
            recent_activities = client.get_activities(0, 5)
            logger.info(f"Fallback fetch returned {len(recent_activities)} activities.")
            for i, act in enumerate(recent_activities):
                logger.debug(f"Fallback Activity {i+1}: {act.get('startTimeLocal', 'N/A')}")
            activities = recent_activities

        # If still no activities, return immediately
        if not activities:
            logger.info("No activities found from Garmin API after fallback.")
            return []

        # 6. Check Which Activities Already Exist in DB
        with conn.cursor() as cursor:
            cursor.execute("SELECT date FROM workout_stats")  # Adjust your table/column names
            existing_dates = {row[0] for row in cursor.fetchall()}
            logger.debug(f"Existing DB Dates (first 10): {sorted(list(existing_dates))[:10]}")

        # 7. Filter Out Duplicate Activities
        new_activities = []
        for activity in activities:
            try:
                # Convert string to date
                activity_datetime = datetime.strptime(activity['startTimeLocal'], "%Y-%m-%d %H:%M:%S")
                activity_date = activity_datetime.date()
            except (KeyError, ValueError) as e:
                logger.error(f"Failed to parse activity date: {str(e)} - Activity: {activity}")
                continue

            if activity_date not in existing_dates:
                new_activities.append(activity)
                logger.debug(f"New activity on {activity_date}")
            else:
                logger.debug(f"Skipping duplicate activity on {activity_date}")

        logger.info(f"Found {len(new_activities)} new activities to store.")

        # 8. Optionally Update Last Fetch Date If Needed
        if new_activities:
            # Example: store the fetch date in a 'fetch_log' table or similar
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO fetch_log (source, fetch_date)
                    VALUES (%s, %s)
                    ON CONFLICT (source)
                    DO UPDATE SET fetch_date = EXCLUDED.fetch_date
                    """,
                    ("garmin", now_utc)
                )
                conn.commit()
                logger.info("Updated last successful fetch date in the database.")

        return new_activities

    except Exception as e:
        logger.error(f"Failed to fetch Garmin data: {str(e)}")
        return []
