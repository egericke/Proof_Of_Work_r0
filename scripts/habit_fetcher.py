# scripts/habit_fetcher.py
import logging
from datetime import datetime, timedelta
from typing import List, Dict
from supabase import create_client, Client

import scripts.config as config

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Create and return a Supabase client using config credentials."""
    return create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def fetch_habits_since(conn: Client, since_days: int = 1) -> List[Dict]:
    """
    Fetch habit data from Supabase since a specified number of days ago.
    """
    try:
        start_date = (datetime.now().date() - timedelta(days=since_days)).isoformat()
        response = conn.table('habit_tracking').select('*').gte('date', start_date).execute()
        
        if response.error:
            logger.error(f"Error fetching habits from Supabase: {response.error}")
            return []
        
        habits = response.data
        logger.info(f"Fetched {len(habits)} habits since {start_date}")
        return habits

    except Exception as e:
        logger.error(f"Failed to fetch habits: {str(e)}")
        return []

def store_habit_analysis(conn: Client, habits: List[Dict]) -> None:
    """
    Analyze habit data (e.g., streaks, consistency) and store results in Supabase.
    Optionally, update a new table like `habit_analytics`.
    """
    try:
        # Example: Count habits by date for consistency
        habit_counts = {}
        for habit in habits:
            date = habit['date']
            habit_counts[date] = habit_counts.get(date, 0) + 1

        # Store analytics (e.g., in a new `habit_analytics` table)
        for date, count in habit_counts.items():
            analytics_data = {
                "date": date,
                "habit_count": count,
                "consistency_score": count / since_days  # Simple metric
            }
            response = conn.table('habit_analytics').upsert([analytics_data]).execute()
            if response.error:
                logger.error(f"Error storing habit analytics: {response.error}")
            else:
                logger.info(f"Stored habit analytics for {date}")

    except Exception as e:
        logger.error(f"Failed to store habit analysis: {str(e)}")

if __name__ == "__main__":
    # Example usage
    supabase_client = get_supabase_client()
    habits = fetch_habits_since(supabase_client, since_days=7)
    if habits:
        store_habit_analysis(supabase_client, habits)
