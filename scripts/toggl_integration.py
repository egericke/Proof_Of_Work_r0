import logging
from datetime import datetime, timedelta
import requests
from typing import List
import os

# Configure logging
logger = logging.getLogger(__name__)

def fetch_toggl_entries(since_days: int = 7) -> List[dict]:
    """
    Fetch time entries from the Toggl API for the specified number of days.

    Args:
        since_days (int, optional): Number of days to look back for entries. Defaults to 7.

    Returns:
        List[dict]: List of parsed time entries with date, project name, tags, and duration.
    """
    # Retrieve and validate API key
    toggl_api_key = os.getenv("TOGGL_API_KEY")
    if not toggl_api_key:
        logger.error("TOGGL_API_KEY is not set in the environment.")
        return []
    if not isinstance(toggl_api_key, str):
        logger.error(f"TOGGL_API_KEY is not a string, got type {type(toggl_api_key)}.")
        return []
    if len(toggl_api_key.strip()) == 0:
        logger.error("TOGGL_API_KEY is empty or whitespace-only.")
        return []
    logger.info(f"Using Toggl API key: {toggl_api_key[:4]}... (length: {len(toggl_api_key)})")

    # Set up session with authentication
    session = requests.Session()
    session.auth = (toggl_api_key, "api_token")


    # Calculate start_date and end_date
    start_date = (datetime.utcnow() - timedelta(days=since_days)).strftime("%Y-%m-%dT00:00:00Z")
    end_date = datetime.utcnow().strftime("%Y-%m-%dT23:59:59Z")  # End of today
    
    # Construct the URL with both parameters
    url = (
        "https://api.track.toggl.com/api/v9/me/time_entries"
        f"?start_date={start_date}&end_date={end_date}"
    )

    # Send API request with error handling
    try:
        resp = session.get(url, timeout=10)
        if resp.status_code == 403:
            logger.error("Authentication failed with status 403. Verify TOGGL_API_KEY validity.")
            return []
        elif resp.status_code == 429:
            logger.warning("Rate limit exceeded (429). Consider reducing fetch frequency.")
            return []
        elif resp.status_code != 200:
            logger.error(f"Toggl fetch failed with status {resp.status_code}: {resp.text}")
            return []
    except requests.exceptions.Timeout:
        logger.error("Toggl API request timed out.")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during Toggl fetch: {str(e)}")
        return []

    # Parse JSON response
    try:
        data = resp.json()
        if not isinstance(data, list):
            logger.error(f"Expected list from Toggl API, got {type(data)}.")
            return []
    except ValueError:
        logger.error("Failed to parse JSON response from Toggl API.")
        return []

    # Process entries
    entries = []
    for entry in data:
        start_str = entry.get("start")
        if not start_str:
            logger.warning("Skipping entry without start time.")
            continue
        try:
            dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        except ValueError as e:
            logger.error(f"Failed to parse start time: {start_str}. Error: {str(e)}")
            continue

        duration_s = entry.get("duration", 0)
        if duration_s < 1:
            continue

        project_name = entry.get("description", "")
        tags = entry.get("tags", []) or []
        if not isinstance(tags, list):
            logger.warning(
                f"Invalid tags format for entry on {dt.strftime('%Y-%m-%d')}. "
                f"Expected list, got {type(tags)}."
            )
            tags = []

        entries.append({
            "date": dt.strftime("%Y-%m-%d"),
            "project_name": project_name,
            "tags": tags,
            "duration_seconds": duration_s
        })

    logger.info(f"Fetched {len(entries)} valid Toggl entries.")
    return entries

def store_toggl_entries(conn, entries: List[dict]) -> None:
    """
    Store the fetched Toggl entries into the database.

    Args:
        conn: Database connection object.
        entries (List[dict]): List of Toggl entries to store.
    """
    cursor = conn.cursor()
    for entry in entries:
        try:
            cursor.execute(
                """
                INSERT INTO toggl_entries (date, project_name, tags, duration_seconds)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                """,
                (entry["date"], entry["project_name"], entry["tags"], entry["duration_seconds"])
            )
        except Exception as e:
            logger.error(f"Failed to store entry for {entry['date']}: {str(e)}")
            conn.rollback()
            continue
    conn.commit()
    logger.info(f"Stored {len(entries)} Toggl entries in the database.")

def fetch_and_store_toggl_data(conn, since_days: int = 7) -> None:
    """
    Fetch Toggl entries for the specified number of days and store them in the database.

    Args:
        conn: Database connection object.
        since_days (int, optional): Number of days to look back for entries. Defaults to 7.
    """
    entries = fetch_toggl_entries(since_days)
    if entries:
        store_toggl_entries(conn, entries)
        logger.info("Toggl data fetched and stored successfully")
    else:
        logger.info("No Toggl entries fetched or stored")
