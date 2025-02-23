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

def store_workout_data(conn: connection, activity: dict) -> None:
    """Upsert activity data from Garmin API into workout_stats."""
    required_keys = [
        'activity_type', 'date', 'favorite', 'title', 'distance',
        'calories', 'time', 'avg_hr', 'max_hr', 'avg_bike_cadence'
    ]
    mapped_activity = {}

    for key in required_keys:
        api_key = API_KEY_MAPPING.get(key)
        if api_key is None:
            logger.error(f"No API key mapping for {key}")
            return
        value = activity.get(api_key)
        if value is None:
            logger.error(f"Missing key '{api_key}' in activity data: {activity}")
            return
        mapped_activity[key] = value

    # Optional: Handle data type conversions (e.g., for date)
    if 'date' in mapped_activity:
        try:
            mapped_activity['date'] = datetime.datetime.strptime(mapped_activity['date'], '%Y-%m-%d %H:%M:%S')
        except ValueError as e:
            logger.error(f"Failed to parse date: {e}")
            return

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
                mapped_activity['activity_type'],
                mapped_activity['date'],
                mapped_activity['favorite'],
                mapped_activity['title'],
                mapped_activity['distance'],
                mapped_activity['calories'],
                mapped_activity['time'],
                mapped_activity['avg_hr'],
                mapped_activity['max_hr'],
                mapped_activity['avg_bike_cadence']
            )
        )
    logger.info("Stored workout data for %s", mapped_activity['date'])
