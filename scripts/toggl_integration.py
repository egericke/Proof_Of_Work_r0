import logging
from datetime import datetime, timedelta
import requests
from typing import List
from . import config  # Relative import from the same package

# Rest of the code remains unchanged
logger = logging.getLogger(__name__)

def fetch_toggl_entries(since_days: int = 7) -> List[dict]:
    """
    Fetch time entries from the Toggl API for the specified number of days.

    Args:
        since_days (int, optional): Number of days to look back for entries. Defaults to 7.

    Returns:
        List[dict]: List of parsed time entries with date, project name, tags, and duration.
    """
    # Validate API key
    toggl_api_key = config.TOGGL_API_KEY
    if not toggl_api_key or not isinstance(toggl_api_key, str):
        logger.error("Invalid or missing TOGGL_API_KEY. Skipping fetch.")
        return []
    logger.info(f"Using Toggl API key: {toggl_api_key[:4]}...")  # Verify key

    # Set up session with authentication
    session = requests.Session()
    session.auth = (toggl_api_key, "api_token")

    # Calculate start date for query
    since_date = (
        datetime.utcnow() - timedelta(days=since_days)
    ).strftime("%Y-%m-%dT00:00:00Z")
    url = (
        "https://api.track.toggl.com/api/v9/me/time_entries"
        f"?start_date={since_date}"
    )

    # Send API request with error handling
    try:
        resp = session.get(url)
        if resp.status_code == 403:
            logger.error("Authentication failed. Check TOGGL_API_KEY.")
            return []
        elif resp.status_code == 429:
            logger.warning("Rate limit exceeded. Consider reducing fetch frequency.")
            return []  # Optional: Implement retry logic here
        elif resp.status_code != 200:
            logger.error(f"Toggl fetch failed with status {resp.status_code}: {resp.text}")
            return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during Toggl fetch: {str(e)}")
        return []

    # Parse JSON response
    try:
        data = resp.json()
    except ValueError:
        logger.error("Failed to parse JSON response from Toggl API.")
        return []

    # Process entries
    entries = []
    for entry in data:
        # Validate and parse start time
        start_str = entry.get("start")
        if not start_str:
            logger.warning("Skipping entry without start time.")
            continue
        try:
            dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        except ValueError as e:
            logger.error(f"Failed to parse start time: {start_str}. Error: {str(e)}")
            continue

        # Skip running timers (duration < 1)
        duration_s = entry.get("duration", 0)
        if duration_s < 1:
            continue

        # Extract project name and tags with validation
        project_name = entry.get("description", "")
        tags = entry.get("tags", []) or []
        if not isinstance(tags, list):
            logger.warning(
                f"Invalid tags format for entry on {dt.strftime('%Y-%m-%d')}. "
                f"Expected list, got {type(tags)}."
            )
            tags = []

        # Append valid entry
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
        # Example: Insert into a table named 'toggl_entries'
        # Adjust the SQL query based on your actual database schema
        cursor.execute(
            """
            INSERT INTO toggl_entries (date, project_name, tags, duration_seconds)
            VALUES (%s, %s, %s, %s)
            """,
            (entry["date"], entry["project_name"], entry["tags"], entry["duration_seconds"])
        )
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
        logger.info("No Toggl entries to store")