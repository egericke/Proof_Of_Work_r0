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
    Create a new database connection using credentials from config.
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
    conn.commit()
    logger.info("Updated last_fetch_date to %s", date_val)


def store_workout_data(conn: connection, activity: dict) -> None:  # Line 43
    """
    Upsert activity data from Garmin CSV in the workout_stats table.
    Activity keys match CSV headers (e.g., activity_type, date, distance, etc.).
    """
    with conn.cursor() as cur:
        cur.execute(  # Line 47 (originally 89 chars)
            """
            INSERT INTO workout_stats (
                activity_type, date, favorite, title, distance,
                calories, time, avg_hr, max_hr, avg_bike_cadence,
                max_bike_cadence, avg_speed, max_speed, total_ascent,
                total_descent, avg_stride_length, training_stress_score,
                total_strokes, avg_swolf, avg_stroke_rate, steps,
                total_reps, total_sets, min_temp, decompression,
                best_lap_time, number_of_laps, max_temp, moving_time,
                elapsed_time, min_elevation, max_elevation
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s
            )
            ON CONFLICT (date, activity_type) DO UPDATE SET
                favorite = EXCLUDED.favorite,
                title = EXCLUDED.title,
                distance = EXCLUDED.distance,
                calories = EXCLUDED.calories,
                time = EXCLUDED.time,
                avg_hr = EXCLUDED.avg_hr,
                max_hr = EXCLUDED.max_hr,
                avg_bike_cadence = EXCLUDED.avg_bike_cadence,
                max_bike_cadence = EXCLUDED.max_bike_cadence,
                avg_speed = EXCLUDED.avg_speed,
                max_speed = EXCLUDED.max_speed,
                total_ascent = EXCLUDED.total_ascent,
                total_descent = EXCLUDED.total_descent,
                avg_stride_length = EXCLUDED.avg_stride_length,
                training_stress_score = EXCLUDED.training_stress_score,
                total_strokes = EXCLUDED.total_strokes,
                avg_swolf = EXCLUDED.avg_swolf,
                avg_stroke_rate = EXCLUDED.avg_stroke_rate,
                steps = EXCLUDED.steps,
                total_reps = EXCLUDED.total_reps,
                total_sets = EXCLUDED.total_sets,
                min_temp = EXCLUDED.min_temp,
                decompression = EXCLUDED.decompression,
                best_lap_time = EXCLUDED.best_lap_time,
                number_of_laps = EXCLUDED.number_of_laps,
                max_temp = EXCLUDED.max_temp,
                moving_time = EXCLUDED.moving_time,
                elapsed_time = EXCLUDED.elapsed_time,
                min_elevation = EXCLUDED.min_elevation,
                max_elevation = EXCLUDED.max_elevation
            """,
            (  # Line 118 (originally 83 chars)
                activity['activity_type'],
                activity['date'],
                activity['favorite'],
                activity['title'],
                activity['distance'],
                activity['calories'],
                activity['time'],
                activity['avg_hr'],
                activity['max_hr'],
                activity['avg_bike_cadence'],
                activity['max_bike_cadence'],
                activity['avg_speed'],
                activity['max_speed'],
                activity['total_ascent'],
                activity['total_descent'],
                activity['avg_stride_length'],
                activity['training_stress_score'],
                activity['total_strokes'],
                activity['avg_swolf'],
                activity['avg_stroke_rate'],
                activity['steps'],
                activity['total_reps'],
                activity['total_sets'],
                activity['min_temp'],
                activity['decompression'],
                activity['best_lap_time'],
                activity['number_of_laps'],
                activity['max_temp'],
                activity['moving_time'],
                activity['elapsed_time'],
                activity['min_elevation'],
                activity['max_elevation']
            )
        )
    logger.info(  # Line 145
        "Stored workout_stats for activity %s on %s",
        activity['activity_type'],
        activity['date']
    )