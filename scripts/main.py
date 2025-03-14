# scripts/main.py
"""
Main script to fetch and process daily data for My Daily Proof.
Fetches Garmin/Strava data, Toggl time entries, and habit data,
storing results in Supabase.
"""

import logging
from datetime import datetime, timedelta

from scripts.database import (
    get_db_connection,
    update_last_successful_fetch_date,
    store_workout_data
)
from scripts.fetcher import fetch_garmin_daily
from scripts.toggl_integration import fetch_and_store_toggl_data
from scripts.habit_fetcher import fetch_habits, analyze_habits, store_habit_analysis, get_supabase_client

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
    
    # Establish database connection for Garmin/Strava/Toggl (existing)
    try:
        conn = get_db_connection()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to establish database connection: {str(e)}")
        return

    # Fetch and store Garmin data (existing)
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

    # Fetch and store Toggl data (existing)
    try:
        fetch_and_store_toggl_data(conn, since_days=7)
        logger.info("Toggl data fetched and stored successfully")
    except Exception as e:
        logger.error(f"Error fetching or storing Toggl data: {str(e)}")

    # Fetch and analyze habit data (corrected)
    try:
        supabase_client = get_supabase_client()
        today = datetime.now().date()
        start_date = today - timedelta(days=1)  # Fetch habits from the last day
        habits = fetch_habits(start_date)  # Fetch habits with a date object
        if habits:
            analysis = analyze_habits(habits)  # Analyze the fetched habits
            store_habit_analysis(analysis, today)  # Store the analysis with the date
            logger.info("Habit data fetched and analyzed successfully")
        else:
            logger.info("No new habit data to fetch")
    except Exception as e:
        logger.error(f"Error fetching or analyzing habit data: {str(e)}")

    # Close database connection (existing)
    try:
        conn.close()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {str(e)}")

if __name__ == "__main__":
    main()
