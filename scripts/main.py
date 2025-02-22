import logging
from datetime import datetime
import scripts.database as database
from scripts.fetcher import fetch_garmin_daily
from scripts.toggl_integration import fetch_and_store_toggl_data
from scripts.vo2max import create_vo2max_table_query, get_latest_vo2max

logger = logging.getLogger(__name__)

def main():
    logging.basicConfig(level=logging.INFO)

    conn = database.get_db_connection()

    # Ensure VO2 max table exists
    with conn.cursor() as cur:
        cur.execute(create_vo2max_table_query())

    # Fetch Garmin activities
    today_str = datetime.now().strftime("%Y-%m-%d")
    last_fetch = database.get_last_successful_fetch_date(conn)
    if str(last_fetch) == today_str:
        logger.info("Already fetched data for today.")
    else:
        activities = fetch_garmin_daily()
        if activities:
            for activity in activities:
                database.store_workout_data(conn, activity)
            database.update_last_successful_fetch_date(conn, datetime.now().date())
        else:
            logger.error("Fetching failed. No workout data stored.")

    # Fetch Toggl data (if API key is provided)
    fetch_and_store_toggl_data(conn, since_days=7)

    # Get latest VO2 max
    vo2 = get_latest_vo2max(conn)
    logger.info("Latest VO2 max: %s", vo2 if vo2 else "None")

    conn.close()
    logger.info("Daily run complete.")

if __name__ == "__main__":
    main()
