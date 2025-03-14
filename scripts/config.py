# scripts/config.py
"""
Environment and logging configuration.
Loads environment variables from .env for local usage,
or from GitHub Actions secrets in CI.
"""

import os
import logging
from dotenv import load_dotenv

# Load .env only when running locally; in production (GitHub Actions, etc.),
# the environment variables come from secrets configured in the workflow.
load_dotenv()

# Set up logging (match main.py's DEBUG level for detailed output)
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for detailed output, matching main.py
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

# Garmin
GARMIN_USERNAME = os.getenv("GARMIN_USERNAME")
GARMIN_PASSWORD = os.getenv("GARMIN_PASSWORD")

# Strava
STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
STRAVA_REFRESH_TOKEN = os.getenv("STRAVA_REFRESH_TOKEN")

# Supabase DB (Session Pooler) credentials
SUPABASE_DB_HOST = os.getenv("SUPABASE_DB_HOST")
SUPABASE_DB_NAME = os.getenv("SUPABASE_DB_NAME")
SUPABASE_DB_USER = os.getenv("SUPABASE_DB_USER")
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
SUPABASE_DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")

# Supabase REST API credentials (for client library and REST API calls, e.g., habit_fetcher.py)
SUPABASE_URL = os.getenv("SUPABASE_URL")  # Remove default value to force environment variable usage
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Remove default value to force environment variable usage

# Twitter
TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")

# Instagram
INSTAGRAM_USER_ID = os.getenv("INSTAGRAM_USER_ID")
INSTAGRAM_PAGE_ACCESS_TOKEN = os.getenv("INSTAGRAM_PAGE_ACCESS_TOKEN")

# Toggl
TOGGL_API_KEY = os.getenv("TOGGL_API_KEY")
