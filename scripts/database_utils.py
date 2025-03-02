# scripts/database_utils.py
"""
Enhanced database utilities with better error handling and fallback data.
"""

import logging
import json
import datetime
from typing import Optional, Dict, List, Any, Union
import psycopg2
from psycopg2.extensions import connection
from psycopg2.extras import RealDictCursor
import scripts.config as config

logger = logging.getLogger(__name__)

# Demo data for tests and when database is unavailable
DEMO_WORKOUT_DATA = [
    {
        "activity_type": "running",
        "date": "2025-02-25 08:30:00",
        "favorite": True,
        "title": "Morning Run",
        "distance": 5000.0,
        "calories": 450,
        "time": 1800,
        "avg_hr": 145,
        "max_hr": 175,
        "avg_bike_cadence": 0
    },
    {
        "activity_type": "cycling",
        "date": "2025-02-24 17:45:00",
        "favorite": False,
        "title": "Evening Ride",
        "distance": 15000.0,
        "calories": 600,
        "time": 3600,
        "avg_hr": 130,
        "max_hr": 160,
        "avg_bike_cadence": 85
    }
]

DEMO_HABIT_DATA = [
    {
        "habit_id": 1,
        "habit_name": "Morning Meditation",
        "habit_date": "2025-02-25",
        "completed": True
    },
    {
        "habit_id": 2,
        "habit_name": "Read 30 Minutes",
        "habit_date": "2025-02-25",
        "completed": False
    },
    {
        "habit_id": 3,
        "habit_name": "Drink Water",
        "habit_date": "2025-02-25",
        "completed": True
    }
]

def get_db_connection() -> Optional[connection]:
    """Create a new database connection using config credentials with better error handling."""
    try:
        conn = psycopg2.connect(
            host=config.SUPABASE_DB_HOST,
            port=config.SUPABASE_DB_PORT,
            database=config.SUPABASE_DB_NAME,
            user=config.SUPABASE_DB_USER,
            password=config.SUPABASE_DB_PASSWORD,
        )
        conn.autocommit = True
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return None

def safe_execute_query(
    conn: Optional[connection], 
    query: str, 
    params: tuple = None,
    use_dict_cursor: bool = False,
    fallback_data: List[Dict] = None
) -> List[Dict]:
    """
    Safely execute a database query with better error handling and fallback data.
    
    Args:
        conn: Database connection (can be None)
        query: SQL query to execute
        params: Query parameters
        use_dict_cursor: Whether to use RealDictCursor
        fallback_data: Data to return if connection is None or query fails
        
    Returns:
        List of dictionaries with query results, or fallback data
    """
    if conn is None:
        logger.warning("Database connection is None, returning fallback data")
        return fallback_data or []
    
    try:
        cursor_factory = RealDictCursor if use_dict_cursor else None
        with conn.cursor(cursor_factory=cursor_factory) as cur:
            cur.execute(query, params)
            if use_dict_cursor:
                result = cur.fetchall()
            else:
                columns = [desc[0] for desc in cur.description]
                result = [dict(zip(columns, row)) for row in cur.fetchall()]
            return result
    except Exception as e:
        logger.error(f"Query execution failed: {str(e)}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        return fallback_data or []

def get_workout_data(
    conn: Optional[connection], 
    start_date: datetime.date, 
    end_date: datetime.date
) -> List[Dict]:
    """Get workout data for date range with fallback to demo data."""
    query = """
        SELECT * FROM workout_stats 
        WHERE date BETWEEN %s AND %s
        ORDER BY date DESC
    """
    return safe_execute_query(
        conn, 
        query, 
        (start_date, end_date), 
        use_dict_cursor=True,
        fallback_data=DEMO_WORKOUT_DATA
    )

def get_habit_data(
    conn: Optional[connection], 
    start_date: datetime.date, 
    end_date: datetime.date
) -> List[Dict]:
    """Get habit data for date range with fallback to demo data."""
    query = """
        SELECT * FROM habit_tracking 
        WHERE habit_date BETWEEN %s AND %s
        ORDER BY habit_date DESC
    """
    return safe_execute_query(
        conn, 
        query, 
        (start_date, end_date), 
        use_dict_cursor=True,
        fallback_data=DEMO_HABIT_DATA
    )

def format_for_frontend(data: List[Dict]) -> List[Dict]:
    """Format data for frontend with safe type conversions."""
    if not data:
        return []
    
    formatted = []
    for item in data:
        formatted_item = {}
        for key, value in item.items():
            # Convert datetime objects to ISO strings
            if isinstance(value, (datetime.datetime, datetime.date)):
                formatted_item[key] = value.isoformat()
            # Convert decimal to float
            elif hasattr(value, 'is_finite') and callable(getattr(value, 'is_finite')):
                formatted_item[key] = float(value)
            # Handle None values
            elif value is None:
                formatted_item[key] = None
            else:
                formatted_item[key] = value
        formatted.append(formatted_item)
    
    return formatted
