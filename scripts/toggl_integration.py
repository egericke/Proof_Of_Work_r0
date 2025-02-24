import logging
from datetime import datetime, timedelta
import os
import requests
from typing import List, Dict
import psycopg2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_toggl_entries(session: requests.Session, since_days: int = 7) -> List[dict]:
    """
    Fetch time entries from the Toggl API for the specified number of days.

    Args:
        session: Authenticated requests.Session object.
        since_days (int, optional): Number of days to look back for entries. Defaults to 7.

    Returns:
        List[dict]: List of time entries with id, date, duration_seconds, project_id, tags, and description.
    """
    start_date = (datetime.utcnow() - timedelta(days=since_days)).strftime("%Y-%m-%dT00:00:00Z")
    end_date = datetime.utcnow().strftime("%Y-%m-%dT23:59:59Z")
    url = f"https://api.track.toggl.com/api/v9/me/time_entries?start_date={start_date}&end_date={end_date}"

    try:
        resp = session.get(url, timeout=10)
        if resp.status_code != 200:
            logger.error(f"Toggl fetch failed: {resp.status_code} - {resp.text}")
            return []
        data = resp.json()
        if not isinstance(data, list):
            logger.error(f"Expected list, got {type(data)}")
            return []
    except Exception as e:
        logger.error(f"Error fetching entries: {str(e)}")
        return []

    entries = []
    for entry in data:
        if "id" not in entry or "start" not in entry:
            logger.warning(f"Skipping invalid entry: {entry}")
            continue
        try:
            dt = datetime.fromisoformat(entry["start"].replace("Z", "+00:00"))
        except ValueError:
            logger.error(f"Invalid start time for entry {entry['id']}: {entry['start']}")
            continue

        duration_s = entry.get("duration", 0)
        if duration_s < 1:
            continue

        tags = entry.get("tags", []) or []
        if not isinstance(tags, list):
            tags = []

        entries.append({
            "id": entry["id"],
            "date": dt.date(),
            "duration_seconds": duration_s,
            "project_id": entry.get("project_id"),
            "tags": tags,
            "description": entry.get("description", "")
        })

    logger.info(f"Fetched {len(entries)} time entries")
    return entries

def fetch_toggl_projects(session: requests.Session, workspace_id: str) -> Dict[int, str]:
    """
    Fetch project data from Toggl API and return a mapping of project_id to project_name.

    Args:
        session: Authenticated requests.Session object.
        workspace_id (str): Toggl workspace ID.

    Returns:
        Dict[int, str]: Mapping of project_id to project_name.
    """
    url = f"https://api.track.toggl.com/api/v9/workspaces/{workspace_id}/projects"
    try:
        resp = session.get(url, timeout=10)
        if resp.status_code != 200:
            logger.error(f"Failed to fetch projects: {resp.status_code} - {resp.text}")
            return {}
        projects = resp.json()
        return {p["id"]: p["name"] for p in projects if "id" in p and "name" in p}
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}")
        return {}

def store_toggl_entries(conn, entries: List[dict], project_mapping: Dict[int, str]) -> None:
    """
    Store Toggl entries in the Supabase database, including project names.

    Args:
        conn: psycopg2 connection to Supabase.
        entries (List[dict]): List of time entries.
        project_mapping (Dict[int, str]): Mapping of project_id to project_name.
    """
    cursor = conn.cursor()
    for entry in entries:
        project_name = project_mapping.get(entry["project_id"], "No Project")
        try:
            cursor.execute(
                """
                INSERT INTO toggl_entries (id, date, duration_seconds, project_id, project_name, tags, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    entry["id"],
                    entry["date"],
                    entry["duration_seconds"],
                    entry["project_id"],
                    project_name,
                    entry["tags"],
                    entry["description"],
                ),
            )
        except Exception as e:
            logger.error(f"Failed to store entry {entry['id']}: {str(e)}")
            conn.rollback()
            continue
    conn.commit()
    cursor.close()
    logger.info(f"Stored {len(entries)} entries in Supabase")

def get_supabase_connection() -> psycopg2.extensions.connection:
    """
    Establish a connection to Supabase.

    Returns:
        psycopg2 connection object.
    """
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("SUPABASE_DB"),
            user=os.getenv("SUPABASE_USER"),
            password=os.getenv("SUPABASE_PASSWORD"),
            host=os.getenv("SUPABASE_HOST"),
            port=os.getenv("SUPABASE_PORT", "5432")
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {str(e)}")
        raise

def fetch_and_store_toggl_data(since_days: int = 7) -> None:
    """
    Fetch Toggl data and store it in Supabase.

    Args:
        since_days (int, optional): Number of days to fetch entries for. Defaults to 7.
    """
    # Set up Toggl API session
    toggl_api_key = os.getenv("TOGGL_API_KEY")
    if not toggl_api_key:
        logger.error("TOGGL_API_KEY not set")
        return

    session = requests.Session()
    session.auth = (toggl_api_key, "api_token")

    # Replace with your actual workspace ID (get it from Toggl or API)
    workspace_id = "YOUR_WORKSPACE_ID"  # e.g., "1234567"

    # Fetch projects and entries
    project_mapping = fetch_toggl_projects(session, workspace_id)
    entries = fetch_toggl_entries(session, since_days)

    if not entries:
        logger.info("No entries to store")
        return

    # Store in Supabase
    conn = get_supabase_connection()
    try:
        store_toggl_entries(conn, entries, project_mapping)
    finally:
        conn.close()

if __name__ == "__main__":
    fetch_and_store_toggl_data()
