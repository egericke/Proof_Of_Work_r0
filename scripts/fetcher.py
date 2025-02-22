# scripts/fetcher.py
from datetime import datetime, timedelta
from garminconnect import Garmin
import os
import logging
from scripts.database import get_last_successful_fetch_date

logger = logging.getLogger(__name__)

def fetch_garmin_daily(conn) -> list:
    try:
        username = os.getenv("GARMIN_USERNAME")
        password = os.getenv("GARMIN_PASSWORD")
        if not username or not password:
            logger.error("Garmin credentials not found.")
            return []

        client = Garmin(username, password)
        client.login()
        logger.info("Successfully logged into Garmin Connect.")

        # Get last fetch date or default to 7 days ago
        last_fetch = get_last_successful_fetch_date(conn)
        start_date = last_fetch if last_fetch else (datetime.now() - timedelta(days=7)).date()
        end_date = datetime.now().date()

        logger.info(f"Fetching activities from {start_date} to {end_date}")
        activities = client.get_activities_by_date(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))

        if not activities:
            logger.info("No new activities found.")
            return []

        logger.info(f"Retrieved {len(activities)} activities.")

        # Filter out existing activities
        with conn.cursor() as cursor:
            cursor.execute("SELECT date FROM workout_data")
            existing_dates = {row[0] for row in cursor.fetchall()}
        
        new_activities = [
            activity for activity in activities
            if datetime.strptime(activity['startTimeLocal'], "%Y-%m-%d %H:%M:%S").date() not in existing_dates
        ]

        logger.info(f"Found {len(new_activities)} new activities to store.")
        return new_activities

    except Exception as e:
        logger.error(f"Failed to fetch Garmin data: {str(e)}")
        return []
