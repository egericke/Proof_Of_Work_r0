# scripts/main.py
import logging
from datetime import datetime
from psycopg2.extensions import connection
from scripts.database import get_db_connection, create_fetch_log_table, get_last_successful_fetch_date, update_last_successful_fetch_date, store_workout_data
from scripts.fetcher import fetch_garmin_daily
from scripts.toggl_integration import fetch_and_store_toggl_data

logger = logging.getLogger(__name__)

def main():
    logging.basicConfig(level=logging.INFO)
    conn = get_db_connection()

    # Ensure the fetch_metadata table exists (you may need to create it manually in Supabase)
    # If not already created, run this SQL in Supabase:
    # CREATE TABLE fetch_metadata (last_fetch_date DATE);

    activities = fetch_garmin_daily(conn)
    if activities:
        for activity in activities:
            store_workout_data(conn, activity)
        update_last_successful_fetch_date(conn, datetime.now().date())
        logger.info("New workout data stored successfully.")
    else:
        logger.info("No new workout data to store.")

    fetch_and_store_toggl_data(conn, since_days=7)

    conn.close()

if __name__ == "__main__":
    main()
