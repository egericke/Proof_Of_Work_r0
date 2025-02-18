# My Daily Proof

This project integrates Garmin + Strava workouts, Toggl time-tracking, and Google Forms habit data into a single Supabase/Postgres database, with a Next.js dashboard and GitHub Actions automation.

---

## Directory Structure

my-daily-proof/
├─ .github/
│  └─ workflows/
│      └─ daily_workout.yml
├─ scripts/
│  ├─ config.py
│  ├─ database.py
│  ├─ fetcher.py
│  ├─ strava_fallback.py
│  ├─ vo2max.py
│  ├─ toggl_integration.py
│  ├─ main.py
│  ├─ post_to_social.py
│  └─ screenshot_chart.js
├─ web/
│  ├─ package.json
│  ├─ pages/
│  │   ├─ api/
│  │   ├─ index.js
│  │   ├─ toggl.js
│  │   └─ habits.js
│  └─ …
├─ requirements.txt
└─ README.md

## Setup & Installation

2. **Clone the Repo**
   ```bash
   git clone https://github.com/YourUser/my-daily-proof.git
   cd my-daily-proof

	2.	Python Dependencies (inside project root)

pip install -r requirements.txt

	•	Requires Python 3.9+ (recommended).
	•	For local dev, create a .env file with your credentials (optional if you only run on GitHub).

	3.	Node Dependencies (inside web/)

cd web
npm install

	•	Installs Next.js, React, Chart.js, and Supabase client libraries.

GitHub Actions & Secrets
	•	Go to your GitHub repo Settings → Secrets and variables → Actions to add secrets like:
	•	GARMIN_USERNAME, GARMIN_PASSWORD
	•	STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
	•	SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, etc.
	•	TOGGL_API_KEY
	•	TWITTER_API_KEY, etc. (if using social posting)
	•	The .github/workflows/daily_workout.yml references these secrets as environment variables.

Usage
	•	Daily Cron: By default, GitHub Actions runs once a day (see on.schedule.cron in daily_workout.yml). It:
	1.	Fetches Garmin/Strava data
	2.	Stores to Supabase
	3.	Fetches Toggl data
	4.	Builds the Next.js site and screenshots it (optional)
	5.	Posts on Twitter/Instagram if credentials are set
	•	Local Testing (optional):
	•	python -m scripts.main to run the main orchestration.
	•	npm run dev in web/ to launch the Next.js dashboard locally.

Google Forms & Habits
	•	A Google Form logs habits, linked to a Google Sheet.
	•	A small Google Apps Script triggers on each submission, sending new rows to Supabase’s habit_tracking table.

Contributing
	•	Feel free to fork and adapt.
	•	Open issues or PRs for improvements.

License
	•	This is just an example. Choose an appropriate license (e.g. MIT) if you plan to open-source.

---

## Final Notes

- Place `requirements.txt` at the **root** of your project for Python dependencies.  
- Inside `web/`, place `package.json` (and typically `package-lock.json` after install).  
- A `README.md` helps others (and future you) understand how to set up and run everything.  

You now have **all** the main files:  
- Python code + `requirements.txt`  
- Next.js code + `package.json`  
- Basic `README.md`  

Enjoy coding, and good luck!
