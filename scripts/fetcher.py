# scripts/fetcher.py
"""
Fetch Garmin fitness data by scraping the Garmin Connect website.
No paid APIs, no watch downloads.
"""

import logging
import time
from datetime import datetime
from typing import Dict, Optional

import requests
from bs4 import BeautifulSoup

import scripts.config as config

logger = logging.getLogger(__name__)

# URL constants
GARMIN_LOGIN_URL = "https://sso.garmin.com/sso/signin"
GARMIN_DASHBOARD_URL = "https://connect.garmin.com/modern/daily-summary"

def login_to_garmin(session: requests.Session) -> bool:
    try:
        login_page = session.get(GARMIN_LOGIN_URL)
        soup = BeautifulSoup(login_page.text, "html.parser")
        form_data = {
            "username": config.GARMIN_USERNAME,
            "password": config.GARMIN_PASSWORD,
            "embed": "false",
        }
        for input_tag in soup.find_all("input", type="hidden"):
            form_data[input_tag.get("name")] = input_tag.get("value")
        response = session.post(GARMIN_LOGIN_URL, data=form_data)
        logger.debug(f"Login response URL: {response.url}")
        logger.debug(f"Login response code: {response.status_code}")
        logger.debug(f"Login response snippet: {response.text[:500]}")  # First 500 chars
        if "modern" in response.url or response.status_code == 200:
            logger.info("Login successful.")
            return True
        else:
            logger.error("Login failed. Check credentials or CAPTCHA.")
            return False
    except Exception as ex:
        logger.error("Login error: %s", ex)
        return False

def calculate_met_hours(activity_type: str, duration_minutes: float) -> float:
    """Estimate MET hours based on activity type and duration."""
    met_values = {"running": 10.0, "cycling": 8.0, "walking": 3.0}
    base_met = met_values.get(activity_type.lower(), 5.0)  # Default to 5.0
    return base_met * (duration_minutes / 60.0)

def fetch_garmin_daily() -> Dict:
    """
    Scrape today's daily summary from Garmin Connect dashboard.
    Raises an exception on failure.
    """
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    })

    # Attempt login
    if not login_to_garmin(session):
        raise Exception("Failed to log into Garmin Connect.")

    # Fetch dashboard
    today_str = datetime.now().strftime("%Y-%m-%d")
    response = session.get(f"{GARMIN_DASHBOARD_URL}/{today_str}")
    if response.status_code != 200:
        raise Exception(f"Failed to fetch dashboard: {response.status_code}")

    # Parse HTML
    soup = BeautifulSoup(response.text, "html.parser")
    
    # These selectors depend on Garmin's current HTML structure
    # Inspect the page source (via browser dev tools) to update these
    steps = soup.select_one(".steps .value")  # Hypothetical class names
    distance = soup.select_one(".distance .value")
    calories = soup.select_one(".calories .value")
    resting_hr = soup.select_one(".resting-hr .value")

    # Extract text and convert to appropriate types
    data = {
        "date": today_str,
        "steps": int(steps.text.replace(",", "")) if steps else 0,
        "distance": float(distance.text.split()[0]) * 1000 if distance else 0.0,  # km to meters
        "calories": int(calories.text.replace(",", "")) if calories else 0,
        "resting_hr": int(resting_hr.text) if resting_hr else None,
        "met_hours": calculate_met_hours("running", 45.0),  # Placeholder; see below
    }

    return data

def fetch_daily_data_with_fallback() -> Optional[Dict]:
    """
    Fetch data via scraping with retry logic. No paid API or watch fallback.
    Returns None if all attempts fail.
    """
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info("Attempting Garmin Connect scrape (attempt %d/%d)...", attempt + 1, max_retries)
            data = fetch_garmin_daily()
            logger.info("Scrape succeeded.")
            return data
        except Exception as ex:
            logger.error("Scrape attempt %d failed: %s", attempt + 1, ex)
            if attempt < max_retries - 1:
                time.sleep(5)  # Delay between retries
    logger.error("All scrape attempts failed. No data retrieved.")
    return None
