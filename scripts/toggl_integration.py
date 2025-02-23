# scripts/toggl_integration.py
"""
Toggl integration: fetch time entries, map them to "Naval buckets," store in
'toggl_time'.
Requires: pip install requests
"""

import logging
import requests
from typing import Dict, List
from datetime import datetime, timedelta
from psycopg2.extensions import connection
import scripts.config as config

logger = logging.getLogger(__name__)

NAVAL_BUCKETS = {
    "Health/Fitness": ["exercise", "workout", "gym"],
    "Reading/Learning": ["reading", "learning", "study"],
    "Meditation/Reflection": ["meditation", "reflection"],
    "Deep Work (Coding/Building)": ["coding", "dev", "programming"],
    "Working (Job/Client)": ["work", "office", "client"],
    "Family/Social": ["family", "friends", "social"],
    "Leisure/Rest": ["leisure", "games", "entertainment", "rest"],
}


def fetch_toggl_entries(since_days: int = 7) -> List[dict]:  # Line 27
    """
    Fetch Toggl time entries from the last `since_days` days.
    Uses Toggl API v8.
    """
    toggl_api_key = config.TOGGL_API_KEY
    if not toggl_api_key:
        logger.warning("No Toggl API key found, skipping Toggl fetch.")
        return []

    session = requests.Session()
    session.auth = (toggl_api_key, "api_token")

    since_date = (datetime.utcnow() - timedelta(days=since_days)).strftime(
        "%Y-%m-%dT00:00:00Z"  # Line 38 (originally 84)
    )
    url = (
        "https://api.track.toggl.com/api/v8/time_entries"  # Line 41 (originally 86)
        f"?start_date={since_date}"
    )
    resp = session.get(url)
    if resp.status_code != 200:
        logger.error("Toggl fetch failed: %s", resp.text)
        return []

    data = resp.json()
    entries = []
    for entry in data:
        start_str = entry.get("start")
        project_name = entry.get("description", "")
        tags = entry.get("tags", []) or []
        duration_s = entry.get("duration", 0)
        if duration_s < 1:
            continue

        dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        entries.append({
            "date": dt.strftime("%Y-%m-%d"),
            "project_name": project_name,
            "tags": tags,
            "duration_seconds": duration_s
        })
    return entries


# ... (other functions unchanged until store_toggl_data) ...


def store_toggl_data(conn: connection, daily_buckets: Dict[str, Dict[str, int]]) -> None:  # Line 95
    """
    Insert or update toggl_time records in the database.
    """
    with conn.cursor() as cur:
        for date_str, buckets in daily_buckets.items():
            for bucket, minutes in buckets.items():
                cur.execute(  # Line 100 (originally 108)
                    """
                    INSERT INTO toggl_time (
                        entry_date, bucket, minutes
                    ) VALUES (%s, %s, %s)
                    ON CONFLICT (entry_date, bucket) DO UPDATE
                    SET minutes = toggl_time.minutes + EXCLUDED.minutes
                    """,
                    (date_str, bucket, minutes)
                )