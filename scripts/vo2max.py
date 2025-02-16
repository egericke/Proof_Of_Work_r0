# scripts/vo2max.py
"""
VO2 max storage and retrieval.
"""

import logging
from datetime import date
from psycopg2.extensions import connection

logger = logging.getLogger(__name__)

def create_vo2max_table_query() -> str:
    return """
    CREATE TABLE IF NOT EXISTS vo2max_tests (
        test_date DATE PRIMARY KEY,
        vo2max_value FLOAT,
        notes TEXT
    );
    """

def insert_vo2max(conn: connection, test_date: date, vo2max_value: float, notes: str = "") -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO vo2max_tests (test_date, vo2max_value, notes)
            VALUES (%s, %s, %s)
            ON CONFLICT (test_date) DO UPDATE
            SET vo2max_value = EXCLUDED.vo2max_value,
                notes = EXCLUDED.notes
            """,
            (test_date, vo2max_value, notes)
        )

def get_latest_vo2max(conn: connection) -> float:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT vo2max_value
            FROM vo2max_tests
            ORDER BY test_date DESC
            LIMIT 1
        """)
        row = cur.fetchone()
    return row[0] if row else None
