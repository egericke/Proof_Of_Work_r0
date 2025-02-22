# scripts/main.py
import logging
from datetime import datetime
from scripts.database import (
    get_db_connection,
    update_last_successful_fetch_date,
    store_workout_data
)
from scripts.fetcher import fetch_garmin_daily
from scripts.toggl_integration import fetch_and_store_toggl_data

logger = logging.getLogger(__name__)


def main():
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting script execution")
    conn = get_db_connection()
    logger.info("Database connection established")

    activities = fetch_garmin_daily(conn)
    if activities:
        for activity in activities:
            store_workout_data(conn, activity)
        update_last_successful_fetch_date(conn, datetime.now().date())
        logger.info("New workout data stored successfully")
    else:
        logger.info("No new workout data to store")

    fetch_and_store_toggl_data(conn, since_days=7)
    logger.info("Toggl data fetched and stored")
    conn.close()


if __name__ == "__main__":
    main()
