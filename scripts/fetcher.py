"""
Fetch Garmin fitness data using the garminconnect library.
"""

import logging
from datetime import datetime
from garminconnect import Garmin
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

def fetch_garmin_daily() -> list:
    """Fetch today's activities from Garmin Connect using the API."""
    try:
        # Get credentials from environment variables
        username = os.getenv("GARMIN_USERNAME")
        password = os.getenv("GARMIN_PASSWORD")
        
        if not username or not password:
            logger.error("Garmin credentials not found in environment variables.")
            return []

        # Initialize Garmin client
        client = Garmin(username, password)
        client.login()
        logger.info("Successfully logged into Garmin Connect.")

        # Get today's date
        today = datetime.now().strftime("%Y-%m-%d")

        # Fetch activities for today
        activities = client.get_activities_by_date(today, today)

        if not activities:
            logger.info("No activities found for today.")
            return []

        # Normalize data for your database schema
        normalized_activities = []
        for activity in activities:
            normalized_activities.append({
                "activity_type": activity.get("activityType", {}).get("typeKey", "unknown"),
                "date": activity.get("startTimeLocal", today),
                "distance": activity.get("distance", 0),
                "calories": activity.get("calories", 0),
                # Add other fields as needed
            })

        logger.info(f"Retrieved {len(normalized_activities)} Garmin activities.")
        return normalized_activities

    except Exception as e:
        logger.error("Failed to fetch Garmin data: %s", str(e))
        return []

def main():
    logging.basicConfig(level=logging.INFO)
    activities = fetch_garmin_daily()
    if activities:
        logger.info("Activities fetched: %s", activities)
    else:
        logger.error("No activities fetched.")

if __name__ == "__main__":
    main()
