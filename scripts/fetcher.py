# scripts/fetcher.py
"""
Primary Garmin fetch + fallback to Strava if Garmin fails.
"""

import logging
from datetime import datetime
from typing import Dict, Optional

# If 'garminconnect' is installed, import it.
# pip install garminconnect
from garminconnect import Garmin, GarminConnectConnectionError, GarminConnectTooManyRequestsError

import scripts.config as config
from scripts.strava_fallback import strava_fetch_daily

logger = logging.getLogger(__name__)

def calculate_met_hours(activity_type: str, duration_minutes: float) -> float:
    """Simple function to estimate MET hours."""
    if activity_type.lower() == "running":
        base_met = 10.0
    elif activity_type.lower() == "cycling":
        base_met = 8.0
    elif activity_type.lower() == "walking":
        base_met = 3.0
    else:
        base_met = 5.0
    return base_met * (duration_minutes / 60.0)

def fetch_garmin_daily() -> Dict:
    """
    Fetch today's daily summary from Garmin.
    Raises an exception on failure.
    """
    client = Garmin(config.GARMIN_USERNAME, config.GARMIN_PASSWORD)
    client.login()

    today_str = datetime.now().strftime("%Y-%m-%d")
    daily_summary = client.get_user_summary(today_str)

    steps = daily_summary.get("steps", 0)
    distance = daily_summary.get("distance", 0.0)       # in meters
    calories = daily_summary.get("totalKilocalories", 0)
    resting_hr = daily_summary.get("restingHeartRate", None)

    # For demonstration, we assume a single 45-min run for MET hours.
    # Real usage: parse actual activities for accurate times.
    activity_type = "running"
    duration_minutes = 45.0
    met_hours = calculate_met_hours(activity_type, duration_minutes)

    return {
        "date": today_str,
        "steps": steps,
        "distance": distance,
        "calories": calories,
        "resting_hr": resting_hr,
        "met_hours": met_hours
    }

def fetch_daily_data_with_fallback() -> Optional[Dict]:
    """
    Attempt Garmin first; fallback to Strava on error.
    Returns a dictionary of daily data or None if both fail.
    """
    try:
        logger.info("Attempting Garmin Connect fetch...")
        return fetch_garmin_daily()
    except (GarminConnectConnectionError, GarminConnectTooManyRequestsError) as ex:
        logger.error("Garmin error: %s", ex)
    except Exception as ex:
        logger.error("General Garmin fetch error: %s", ex)

    logger.info("Falling back to Strava.")
    data = strava_fetch_daily()
    if data:
        logger.info("Strava fallback succeeded.")
    else:
        logger.error("Strava fallback failed. No data.")
    return data
