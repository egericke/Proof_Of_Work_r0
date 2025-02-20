# scripts/main.py
"""
Main script run daily by GitHub Actions.
"""

import logging
from datetime import datetime

import scripts.database as database
from scripts.fetcher import fetch_daily_data_with_fallback
from scripts.vo2max import create_vo2max_table_query, get_latest_vo2max
from scripts.toggl_integration import fetch_and_store_toggl_data

logger = logging.getLogger(__name__)

def main() -> None:
    logging.basicConfig(level=logging.DEBUG)

    conn = database.get_db_connection()

    # Ensure the vo2max table exists
    with conn.cursor() as cur:
        cur.execute(create_vo2max_table_query())

    # Fetch Garmin data via scraping
    today_str = datetime.now().strftime("%Y-%m-%d")
    last_fetch = database.get_last_successful_fetch_date(conn)
    if str(last_fetch) == today_str:
        logger.info("Already fetched data for today.")
    else:
        daily_data = fetch_daily_data_with_fallback()
        if daily_data:
            database.store_workout_data(conn, daily_data)
            database.update_last_successful_fetch_date(conn, datetime.now().date())
        else:
            logger.error("Scraping failed. No workout data stored.")

    # Toggl
    fetch_and_store_toggl_data(conn, since_days=7)

    # VO2 max
    vo2 = get_latest_vo2max(conn)
    logger.info("Latest VO2 max: %s", vo2 if vo2 else "None")

    conn.close()
    logger.info("Daily run complete.")

if __name__ == "__main__":
    main()
