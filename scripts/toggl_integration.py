def fetch_toggl_entries(since_days: int = 7) -> list[dict]:
    toggl_api_key = config.TOGGL_API_KEY
    logger.info(f"Using Toggl API key: {toggl_api_key[:4]}...")  # Verify key
    if not toggl_api_key:
        logger.error("TOGGL_API_KEY is not set. Skipping fetch.")
        return []
    session = requests.Session()
    session.auth = (toggl_api_key, "api_token")
    since_date = (
        datetime.utcnow() - timedelta(days=since_days)
    ).strftime("%Y-%m-%dT00:00:00Z")
    url = (
        "https://api.track.toggl.com/api/v8/time_entries"
        f"?start_date={since_date}"
    )
    resp = session.get(url)
    if resp.status_code != 200:
        logger.error(f"Toggl fetch failed with status {resp.status_code}: {resp.text}")
        return []
    data = resp.json()
    entries = []
    for entry in data:
        start_str = entry.get("start")
        project_name = entry.get("description", "")
        tags = entry.get("tags", []) or []
        duration_s = entry.get("duration", 0)
        if duration_s < 1:  # Skip running timers (negative duration)
            continue
        dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        entries.append({
            "date": dt.strftime("%Y-%m-%d"),
            "project_name": project_name,
            "tags": tags,
            "duration_seconds": duration_s
        })
    return entries
