import logging
from datetime import datetime
from scripts.database import (
    get_db_connection,
    update_last_successful_fetch_date,
    store_workout_data
)
from scripts.fetcher import fetch_garmin_daily
from scripts.toggl_integration import fetch_and_store_toggl_data

# Set up logging to console and file
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for detailed output
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    handlers=[
        logging.FileHandler('script.log'),  # Save logs to script.log
        logging.StreamHandler()             # Also print to console
    ]
)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting script execution")
    
    # Establish database connection
    try:
        conn = get_db_connection()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to establish database connection: {str(e)}")
        return

    # Fetch and store Garmin data
    try:
        activities = fetch_garmin_daily(conn)
        if activities:
            for activity in activities:
                logger.debug(f"Activity data: {activity}")
                store_workout_data(conn, activity)
            update_last_successful_fetch_date(conn, datetime.now().date())
            logger.info("New workout data stored successfully")
        else:
            logger.info("No new workout data to store")
    except Exception as e:
        logger.error(f"Error fetching or storing Garmin data: {str(e)}")

    # Fetch and store Toggl data
    try:
        fetch_and_store_toggl_data(conn, since_days=7)
        logger.info("Toggl data fetched and stored successfully")
    except Exception as e:
        logger.error(f"Error fetching or storing Toggl data: {str(e)}")

    # Close database connection
    try:
        conn.close()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {str(e)}")

if __name__ == "__main__":
    main()