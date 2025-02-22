# scripts/strava_fallback.py
"""
Strava fallback fetch if Garmin fails.
Requires 'stravalib' library: pip install stravalib
"""

import logging
from typing import Dict, Optional
from datetime import datetime
from stravalib.client import Client

import scripts.config as config

logger = logging.getLogger(__name__)


def strava_fetch_daily() -> Optional[Dict]:
    """
    Fetch the latest Strava activity as a fallback approach.
    Returns a daily summary-like dict or None if no data or missing credentials.
    """
    if not (
        config.STRAVA_CLIENT_ID
        and config.STRAVA_CLIENT_SECRET
        and config.STRAVA_REFRESH_TOKEN
    ):
        logger.error("Strava credentials missing.")
        return None

    client = Client()
    refresh_resp = client.refresh_access_token(
        client_id=config.STRAVA_CLIENT_ID,
        client_secret=config.STRAVA_CLIENT_SECRET,
        refresh_token=config.STRAVA_REFRESH_TOKEN
    )
    client.access_token = refresh_resp["access_token"]

    activities = client.get_activities(limit=1)
    latest = next(activities, None)
    if not latest:
        return None

    distance_m = latest.distance.num  # meters
    moving_time_s = latest.moving_time.total_seconds()
    duration_h = moving_time_s / 3600.0

    # Simple MET assumption
    met = 7.0
    avg_speed = distance_m / moving_time_s if moving_time_s > 0 else 0
    if avg_speed > 2.8:  # ~10 km/h
        met = 10.0

    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "steps": None,
        "distance": distance_m,
        "calories": getattr(latest, "calories", None),
        "resting_hr": None,
        "met_hours": met * duration_h
    }
