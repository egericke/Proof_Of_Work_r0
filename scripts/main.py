# scripts/main.py
import logging
from scripts.fetcher import fetch_garmin_daily
from scripts.database import get_db_connection, update_last_successful_fetch_date, get_last_successful_fetch_date
from datetime import datetime

logger = logging.getLogger(__name__)

def store_workout_data(conn, activity):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO workout_data (date, activity_type, duration, distance, calories)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                datetime.strptime(activity['startTimeLocal'], "%Y-%m-%d %H:%M:%S").date(),
                activity['activityType']['typeKey'],
                activity['duration'],
                activity['distance'],
                activity['calories']
            )
        )
        conn.commit()

def main():
    logging.basicConfig(level=logging.INFO)
    conn = get_db_connection()

    activities = fetch_garmin_daily(conn)
    if activities:
        for activity in activities:
            store_workout_data(conn, activity)
        update_last_successful_fetch_date(conn, datetime.now().date())
        logger.info("New workout data stored successfully.")
    else:
        logger.info("No new workout data to store.")

    conn.close()

if __name__ == "__main__":
    main()
