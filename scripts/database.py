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
    """Upsert activity data from Garmin CSV into workout_stats."""
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
                activity['activity_type'],
                activity['date'],
                activity['favorite'],
                activity['title'],
                activity['distance'],
                activity['calories'],
                activity['time'],
                activity['avg_hr'],
                activity['max_hr'],
                activity['avg_bike_cadence']
            )
        )
    logger.info("Stored workout data for %s", activity['date'])
