# scripts/main.py
import logging
import subprocess
import json
from datetime import datetime

import scripts.database as database
from scripts.vo2max import create_vo2max_table_query, get_latest_vo2max
from scripts.toggl_integration import fetch_and_store_toggl_data

logger = logging.getLogger(__name__)

def fetch_garmin_daily() -> dict:
    """Fetch Garmin data using Puppeteer script."""
    try:
        result = subprocess.run(
            ['node', 'scripts/garmin_scrape.js'],
            capture_output=True,
            text=True,
            check=True,
        )
        data = json.loads(result.stdout)
        logger.info("Garmin data fetched successfully.")
        return data
    except subprocess.CalledProcessError as e:
        logger.error("Garmin scrape failed: %s", e.stderr)
        return None
    except json.JSONDecodeError as e:
        logger.error("Failed to parse Garmin data: %s", e)
        return None

def main() -> None:
    logging.basicConfig(level=logging.INFO)

    conn = database.get_db_connection()

    # Ensure the vo2max table exists
    with conn.cursor() as cur:
        cur.execute(create_vo2max_table_query())

    # Fetch Garmin data
    today_str = datetime.now().strftime("%Y-%m-%d")
    last_fetch = database.get_last_successful_fetch_date(conn)
    if str(last_fetch) == today_str:
        logger.info("Already fetched data for today.")
    else:
        daily_data = fetch_garmin_daily()
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
