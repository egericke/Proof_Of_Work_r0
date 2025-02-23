# scripts/fetcher.py
from datetime import datetime, timedelta
import logging
from typing import List
import pytz  # Ensure pytz is installed
from psycopg2.extensions import connection
from garminconnect import Garmin

import scripts.config as config
from scripts.database import get_last_successful_fetch_date

logger = logging.getLogger(__name__)

def fetch_garmin_daily(conn: connection) -> List[dict]:
    """
    Fetch Garmin activities since the last successful fetch or 30 days ago, ensuring
    current day's activities are included by extending end_date. Only return new activities.
    """
    try:
        # Validate credentials
        username = config.GARMIN_USERNAME
        password = config.GARMIN_PASSWORD
        if not username or not password:
            logger.error("Garmin credentials not found.")
            return []

        # Initialize client
        client = Garmin(username, password)
        client.login()
        logger.info("Successfully logged into Garmin Connect.")

        # Use timezone-aware datetimes in UTC
        utc = pytz.UTC
        now_utc = datetime.now(utc)

        # Get last fetch date or default to 30 days ago
        last_fetch = get_last_successful_fetch_date(conn)
        if last_fetch:
            # Ensure last_fetch is UTC-aware
            last_fetch = last_fetch.replace(tzinfo=utc)
            start_date = last_fetch.date()
        else:
            start_date = (now_utc - timedelta(days=30)).date()

        # Extend end_date to tomorrow for inclusivity
        end_date = (now_utc + timedelta(days=1)).date()

        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        logger.info(f"Fetching activities from {start_date_str} to {end_date_str}")

        # Fetch activities
        activities = client.get_activities_by_date(start_date_str, end_date_str)
        logger.debug(f"Raw Garmin API response: {activities}")

        # Log sample activity dates for diagnostics
        if activities:
            for i, activity in enumerate(activities[:3]):  # Up to 3 samples
                local_time = activity.get('startTimeLocal', 'N/A')
                logger.debug(f"Activity {i+1} startTimeLocal: {local_time}")
        else:
            # Fallback: Fetch 5 recent activities if date range fails
            logger.info("No activities in date range. Fetching 5 recent activities.")
            activities = client.get_activities(0, 5)
            logger.info(f"Fallback fetch returned {len(activities)} activities.")
            if activities:
                for i, activity in enumerate(activities):
                    logger.debug(f"Recent activity {i+1}: {activity.get('startTimeLocal', 'N/A')}")

        if not activities:
            logger.info("No activities found after fallback.")
            return []

        # Filter out existing activities
        with conn.cursor() as cursor:
            cursor.execute("SELECT date FROM workout_stats")
            existing_dates = {row[0] for row in cursor.fetchall()}
            logger.debug(f"Existing dates in DB: {sorted(existing_dates)}")

        new_activities = []
        for activity in activities:
            try:
                activity_date = datetime.strptime(
                    activity['startTimeLocal'], "%Y-%m-%d %H:%M:%S"
                ).date()
                if activity_date not in existing_dates:
                    new_activities.append(activity)
                    logger.debug(f"New activity on {activity_date}")
                else:
                    logger.debug(f"Skipping activity on {activity_date} (already in DB)")
            except (KeyError, ValueError) as e:
                logger.error(f"Failed to parse activity date: {str(e)}. Activity: {activity}")
                continue

        logger.info(f"Found {len(new_activities)} new activities to store.")

        # Update last fetch date only if new activities are stored
        if new_activities:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO fetch_log (source, fetch_date) VALUES (%s, %s) "
                    "ON CONFLICT (source) DO UPDATE SET fetch_date = EXCLUDED.fetch_date",
                    ("garmin", now_utc)
                )
                conn.commit()
                logger.info("Updated last successful fetch date.")

        return new_activities

    except Exception as e:
        logger.error(f"Failed to fetch Garmin data: {str(e)}")
        return []
