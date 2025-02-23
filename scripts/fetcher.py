# scripts/fetcher.py
from datetime import datetime, timedelta
import logging
from typing import List
from psycopg2.extensions import connection
from garminconnect import Garmin

import scripts.config as config
from scripts.database import get_last_successful_fetch_date

logger = logging.getLogger(__name__)


def fetch_garmin_daily(conn: connection) -> List[dict]:
    """
    Fetch Garmin activities since the last successful fetch or 7 days ago.
    Only return activities not already stored in the database.
    """
    try:
        username = config.GARMIN_USERNAME
        password = config.GARMIN_PASSWORD
        if not username or not password:
            logger.error("Garmin credentials not found.")
            return []

        client = Garmin(username, password)
        client.login()
        logger.info("Successfully logged into Garmin Connect.")

        last_fetch = get_last_successful_fetch_date(conn)
        start_date = (
            last_fetch if last_fetch else (datetime.now() - timedelta(days=7))
        ).date()
        end_date = datetime.now().date()

        logger.info(f"Fetching activities from {start_date} to {end_date}")
        activities = client.get_activities_by_date(
            start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")
        )

        if not activities:
            logger.info("No new activities found from Garmin API.")
            return []

        logger.info(f"Retrieved {len(activities)} activities from API.")
        # Log sample activity date for debugging
        if activities:
            sample_date = activities[0]['startTimeLocal']
            logger.debug(f"Sample activity date: {sample_date}")

        with conn.cursor() as cursor:
            cursor.execute("SELECT date FROM workout_stats")
            existing_dates = {row[0] for row in cursor.fetchall()}
            logger.debug(f"Existing dates in DB: {existing_dates}")

        new_activities = []
        for activity in activities:
            activity_date = datetime.strptime(
                activity['startTimeLocal'], "%Y-%m-%d %H:%M:%S"
            ).date()  # Normalize to date-only
            if activity_date not in existing_dates:
                new_activities.append(activity)
            else:
                logger.debug(
                    f"Filtered out activity on {activity_date} "
                    "as already in DB"
                )

        logger.info(f"Found {len(new_activities)} new activities to store.")
        return new_activities

    except Exception as e:
        logger.error(f"Failed to fetch Garmin data: {str(e)}")
        return []
