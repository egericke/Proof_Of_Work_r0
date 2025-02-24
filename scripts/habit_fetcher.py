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

def fetch_habits(start_date: datetime.date) -> List[Dict]:
    """Fetch habits from Supabase for the given date range."""
    try:
        supabase_client = get_supabase_client()
        response = supabase_client.table("habit_tracking").select("*").gte("habit_date", start_date).execute()
        habits = response.data if response.data else []
        logger.info(f"Fetched {len(habits)} habits from Supabase for date range starting {start_date}")
        return habits
    except Exception as e:
        logger.error(f"Failed to fetch habits: {str(e)}")
        return []

def analyze_habits(habits: List[Dict]) -> Dict:
    """Analyze habit data and return summary statistics."""
    if not habits:
        return {"total_habits": 0, "completed_habits": 0, "completion_rate": 0.0}

    total_habits = len(habits)
    completed_habits = sum(1 for habit in habits if habit.get("completed", False))
    completion_rate = (completed_habits / total_habits * 100) if total_habits > 0 else 0.0

    return {
        "total_habits": total_habits,
        "completed_habits": completed_habits,
        "completion_rate": completion_rate
    }


def store_habit_analysis(analysis: Dict, date: datetime.date) -> None:
    """Store habit analysis in Supabase."""
    supabase_client = get_supabase_client()  # Assuming this retrieves your Supabase client
    try:
        # Convert the date object to a string in 'YYYY-MM-DD' format
        date_str = date.isoformat()
        
        # Prepare the data to insert, matching the table's column names
        data = {
            "date": date_str,
            "habit_count": analysis["total_habits"],
            "consistency_score": analysis["completion_rate"]
        }
        
        # Insert the data into the "habit_analytics" table
        response = supabase_client.table("habit_analytics").insert(data).execute()
        logger.info(f"Stored habit analysis for {date_str}")
    except Exception as e:
        logger.error(f"Failed to store habit analysis: {str(e)}")
        raise  # Optionally re-raise the exception for further handling

if __name__ == "__main__":
    today = datetime.now().date()
    start_date = today - timedelta(days=7)  # Fetch habits from the last 7 days
    habits = fetch_habits(start_date)
    analysis = analyze_habits(habits)
    store_habit_analysis(analysis, today)
