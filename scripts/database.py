# scripts/database.py
"""
Database connection and helper functions.
Uses psycopg2 for direct Postgres (Supabase) access.
"""

import logging
import datetime
from typing import Optional
import psycopg2
from psycopg2.extensions import connection
import scripts.config as config

logger = logging.getLogger(__name__)

# Mapping of database keys to actual API keys (update these based on logs)
API_KEY_MAPPING = {
    'activity_type': 'activityType',       # Replace with actual API key
    'date': 'startTimeLocal',              # Replace with actual API key
    'favorite': 'isFavorite',              # Replace with actual API key
    'title': 'activityName',               # Replace with actual API key
    'distance': 'distance',                # Replace with actual API key
    'calories': 'calories',                # Replace with actual API key
    'time': 'duration',                    # Replace with actual API key
    'avg_hr': 'averageHeartRate',          # Replace with actual API key
    'max_hr': 'maxHeartRate',              # Replace with actual API key
    'avg_bike_cadence': 'averageCadence'   # Replace with actual API key
}

def get_db_connection() -> connection:
    """Create a new database connection using config credentials."""
    conn = psycopg2.connect(
        host=config.SUPABASE_DB_HOST,
        port=config.SUPABASE_DB_PORT,
        database=config.SUPABASE_DB_NAME,
        user=config.SUPABASE_DB_USER,
        password=config.SUPABASE_DB_PASSWORD,
    )
    conn.autocommit = True
    return conn

def get_last_successful_fetch_date(
    conn: connection
) -> Optional[datetime.date]:
    """Get the most recent date we successfully fetched workout data."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT last_fetch_date
            FROM fetch_metadata
            ORDER BY last_fetch_date DESC
            LIMIT 1
        """)
        row = cur.fetchone()
    return row[0] if row else None


def update_last_successful_fetch_date(
    conn: connection,
    date_val: datetime.date
) -> None:
    """Insert a new row to mark the last successful fetch date."""
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO fetch_metadata (last_fetch_date) "
            "VALUES (%s)",
            (date_val,)
        )
    conn.commit()
    logger.info("Updated last_fetch_date to %s", date_val)

def store_workout_data(conn, activity):
    """Upsert activity data from Garmin API into workout_stats."""
    try:
        # Extract and transform the necessary data
        activity_type = activity['activityType']['typeKey']  # e.g., 'running'
        date_str = activity['startTimeLocal']  # e.g., '2025-02-22 10:10:39'
        date = datetime.datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
        favorite = activity['favorite']  # Correct key is 'favorite', not 'isFavorite'
        title = activity['activityName']
        distance = activity['distance']  # in meters, consider converting to km if needed
        calories = activity['calories']
        time = activity['duration']  # in seconds, consider converting to minutes if needed
        avg_hr = activity.get('averageHR', 0)  # Use 0 or None if missing
        max_hr = activity.get('maxHR', 0)
        
        # Handle cadence based on activity type
        if activity_type == 'running':
            avg_bike_cadence = activity.get('averageRunningCadenceInStepsPerMinute', 0)
        elif activity_type == 'cycling' or activity_type == 'indoor_cycling':
            avg_bike_cadence = activity.get('averageCadence', 0)  # Adjust based on actual key
        else:
            avg_bike_cadence = 0

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO workout_stats (
                    activity_type, date, favorite, title, distance,
                    calories, time, avg_hr, max_hr, avg_bike_cadence
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                ) ON CONFLICT (date, activity_type) DO UPDATE SET
                    favorite = EXCLUDED.favorite,
                    title = EXCLUDED.title,
                    distance = EXCLUDED.distance,
                    calories = EXCLUDED.calories,
                    time = EXCLUDED.time,
                    avg_hr = EXCLUDED.avg_hr,
                    max_hr = EXCLUDED.max_hr,
                    avg_bike_cadence = EXCLUDED.avg_bike_cadence
                """,
                (
                    activity_type,
                    date,
                    favorite,
                    title,
                    distance,
                    calories,
                    time,
                    avg_hr,
                    max_hr,
                    avg_bike_cadence
                )
            )
        logger.info("Stored workout data for %s", date)
    except KeyError as e:
        logger.error(f"Missing key in activity data: {e}. Activity: {activity}")
    except Exception as e:
        logger.error(f"Failed to store workout data: {e}")
