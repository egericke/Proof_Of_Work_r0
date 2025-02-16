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
    """
    Create a new database connection to Supabase/Postgres.
    Set autocommit to True for simpler usage in small scripts.
    """
    conn = psycopg2.connect(
        host=config.SUPABASE_DB_HOST,
        port=config.SUPABASE_DB_PORT,
        database=config.SUPABASE_DB_NAME,
        user=config.SUPABASE_DB_USER,
        password=config.SUPABASE_DB_PASSWORD,
    )
    conn.autocommit = True
    return conn

def get_last_successful_fetch_date(conn: connection) -> Optional[datetime.date]:
    """
    Get the most recent date we successfully fetched workout data.
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT last_fetch_date
            FROM fetch_metadata
            ORDER BY last_fetch_date DESC
            LIMIT 1
        """)
        row = cur.fetchone()
    return row[0] if row else None

def update_last_successful_fetch_date(conn: connection, date_val: datetime.date) -> None:
    """
    Insert a new row into fetch_metadata to mark the last successful fetch date.
    """
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO fetch_metadata (last_fetch_date) VALUES (%s)",
            (date_val,)
        )
    logger.info("Updated last_fetch_date to %s", date_val)

def store_workout_data(conn: connection, data: dict) -> None:
    """
    Upsert daily workout stats in the workout_stats table.
    data keys: date, steps, distance, calories, resting_hr, met_hours
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO workout_stats 
                (workout_date, steps, distance, calories, resting_hr, met_hours)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (workout_date) DO UPDATE
            SET steps       = EXCLUDED.steps,
                distance    = EXCLUDED.distance,
                calories    = EXCLUDED.calories,
                resting_hr  = EXCLUDED.resting_hr,
                met_hours   = EXCLUDED.met_hours
            """,
            (
                data["date"],
                data.get("steps"),
                data.get("distance"),
                data.get("calories"),
                data.get("resting_hr"),
                data.get("met_hours"),
            )
        )
    logger.info("Stored workout_stats for date %s", data["date"])
