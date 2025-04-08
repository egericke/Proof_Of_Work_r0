# My Daily Proof

![Dashboard Screenshot](dashboard-screenshot.png)

A personal dashboard that integrates fitness data from Garmin and Strava, time-tracking data from Toggl, and habit tracking via Google Forms. Data is stored in a Supabase/PostgreSQL database and visualized through a responsive Next.js dashboard.

By making fitness, time management, and habit data public, this project aims to promote accountability and continuous improvement.

**New:** Includes daily automated Twitter posts showing the Habit Status!

## Inspiration

This dashboard is influenced by several thought leaders:

- **Naval Ravikant**: Prioritizing health, learning, and deep work as foundational elements for personal growth.
- **Peter Attia**: Focusing on fitness metrics like VO2 max and other longevity indicators to optimize long-term health.
- **Balaji Srinivasan**: Implementing a "Proof of Workout" concept for public accountability in fitness and productivity.
- **James Clear**: Emphasizing small, consistent habits through public habit tracking to drive meaningful change.

## Features

- **Overview Dashboard**: At-a-glance view of key metrics and recent activities
- **Fitness Tracking**: Workout history, VO2 max trends, activity types, and workout statistics
- **Time Management**: Visualization of time spent across different categories (Deep Work, Learning, etc.)
- **Habit Monitoring**: Habit streaks, completion rates, and yearly habit calendar view
- **Automated Twitter Posting**: Daily screenshot of the Habits Status page posted to Twitter with a timestamp.
- **Responsive Design**: Mobile and desktop-friendly interface with dark theme
- **Offline Fallbacks**: Graceful degradation with fallback data when database is unavailable

## Architecture

### Data Flow

```mermaid
graph TD
    A[GitHub Actions] -->|Triggers Daily| B(main.py)
    B -->|Fetches Data| C[fetcher.py]
    C -->|Garmin API| D[Garmin Data]
    C -->|Strava API| E[Strava Data]
    B -->|Stores Data| F[database.py]
    F -->|Supabase| G[workout_stats]
    F -->|Supabase| H[fetch_metadata]
    B -->|Fetches Toggl Data| I[toggl_integration.py]
    I -->|Toggl API| J[Toggl Data]
    I -->|Stores in| K[toggl_entries]
    P[habit_tracking] <--|Apps Script| O[Google Sheet] <--|Logs Habits| N[Google Forms]

    subgraph "Frontend & Automation"
        direction LR
        Q[Next.js Dashboard] -->|Queries| R[Supabase Tables]
        A -->|Runs| S(Screenshot & Post)
        S -->|Screenshots| Q
        S -->|Posts To| M[Twitter API]
    end

    R --- G
    R --- H
    R --- K
    R --- P
    R --> V[vo2max_tests]

    B --> V
```

### Directory Structure

```
my-daily-proof/
├─ .github/workflows/          # GitHub Actions workflows
│  ├─ daily_workout.yml       # Daily data fetch & Twitter post job (Updated)
│  ├─ vercel-deploy.yml       # Vercel deployment job
│  └─ daily_workout.yml       # Daily data fetch & Twitter post job (Updated)
├─ scripts/                    # Python & Node.js scripts
│  ├─ config.py               # Environment configuration
│  ├─ database.py             # Database operations
│  ├─ fetcher.py              # Garmin data fetching
│  ├─ strava_fallback.py      # Strava fallback fetching
│  ├─ toggl_integration.py    # Toggl time tracking
│  ├─ vo2max.py               # VO2 max tracking
│  ├─ habit_fetcher.py        # Habit data processing
│  ├─ post_to_social.py       # Handles posting (Used by Action)
│  ├─ screenshot_habits.js    # NEW: Takes screenshot of habits page
│  ├─ package.json            # Node.js deps for scripts (puppeteer)
│  └─ main.py                 # Main data fetching orchestration script
├─ web/                        # Next.js dashboard
│  ├─ components/             # React components
│  │  ├─ panels/              # Dashboard panels (HabitsPanel Updated)
│  │  └─ ui/                  # UI components
│  ├─ pages/                  # Next.js pages (habits.js used for screenshot)
│  │  ├─ api/                 # API routes
│  │  └─ index.js             # Main dashboard entry
│  ├─ utils/                  # Utility functions
│  │  ├─ supabaseClient.js    # Supabase client (Updated for fallback robustness)
│  │  └─ fallbackData.js      # Offline fallback data
│  ├─ styles/                 # CSS styles
│  ├─ package.json            # Node.js dependencies for web app
│  └─ next.config.js          # Next.js configuration
└─ requirements.txt            # Python dependencies (Updated)
```

## Technology Stack

- **Backend**:
  - Python 3.10+
  - Supabase PostgreSQL
  - GitHub Actions for automation
  
- **Data Sources**:
  - Garmin Connect API
  - Strava API (fallback)
  - Toggl API
  - Google Forms/Sheets
  
- **Frontend**:
  - Next.js
  - React
  - Tailwind CSS
  - Chart.js / react-chartjs-2
 
- **Automation**:
  - Puppeteer (for screenshots)
  - Tweepy (for Twitter posting)

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/my-daily-proof.git
cd my-daily-proof
```

### 2. Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. Node.js Dependencies (Scripts)
Install dependencies for the screenshot script:

```bash
cd scripts
npm install
cd ..
```

### 4. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the following tables:
   - `workout_stats`: Stores workout data
   - `fetch_metadata`: Tracks data fetch status
   - `toggl_entries`: Stores time tracking data
   - `vo2max_tests`: Stores VO2 max readings
   - `habit_tracking`: Stores habit data
   - `habit_analytics`: (optional, used by habit_fetcher.py)

### 5. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Garmin
GARMIN_USERNAME=your_garmin_username
GARMIN_PASSWORD=your_garmin_password

# Strava
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_DB_HOST=your_supabase_db_host
SUPABASE_DB_PORT=your_supabase_db_port
SUPABASE_DB_NAME=your_supabase_db_name
SUPABASE_DB_USER=your_supabase_db_user
SUPABASE_DB_PASSWORD=your_supabase_db_password

# Toggl
TOGGL_API_KEY=your_toggl_api_key

# Optional: Social Media
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

### 6. Next.js Setup

```bash
cd web
npm install
```

### 6. GitHub Actions Setup

Add ALL the environment variables listed above (including the new Twitter keys) as GitHub repository secrets. The workflow (daily_workout.yml) is configured to read these secrets.

## Usage

### Manual Data Collection

Run the Python script to fetch and store data:

```bash
python -m scripts.main
```

### Starting the Dashboard

```bash
cd web
npm run dev
```

Visit `http://localhost:3000` to view the dashboard. Visit `http://localhost:3000/habits` to see the page that will be screenshotted.

### Daily Automation
The GitHub Action (.github/workflows/daily_workout.yml) is scheduled to run daily. It will:

1. Fetch workout and Toggl data using the Python scripts.
2. Build and run the Next.js app locally within the action runner.
3. Take a screenshot of the Habits page (/habits) using Puppeteer.
4. Stop the local Next.js server.
5. Post the screenshot along with the current date/time to Twitter using the credentials stored in secrets.


### Production Deployment

The project can be deployed to Vercel or GitHub Pages:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel
3. Deploy the Next.js app

## Data Sources Setup

### Garmin Connect

Requires a Garmin Connect account. Credentials are used to fetch activity data through the unofficial API.

### Strava

1. Create a Strava API application at [strava.com/settings/api](https://www.strava.com/settings/api)
2. Generate refresh token using OAuth 2.0 flow
3. Configure your projects to map to "buckets" (Deep Work, Learning, etc.). The toggl_integration.py script maps project names to the project_name column in toggl_entries.

### Toggl

1. Create a Toggl account
2. Get your API token from [track.toggl.com/profile](https://track.toggl.com/profile)
3. Configure your projects to map to "buckets" (Deep Work, Learning, etc.)

### Habit Tracking

1. Create a Google Form for daily habit tracking
2. Set up Google Apps Script to send data to Supabase

### Twitter

1. Apply for a Twitter Developer account and create an App with v1.1 API access (Essential or Elevated access might be needed for posting media).
2. Generate API Key, API Secret Key, Access Token, and Access Token Secret for your App.
3. Add these four keys as GitHub repository secrets (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Naval Ravikant, Peter Attia, Balaji Srinivasan, and James Clear for inspiration
- Open-source libraries and APIs that made this project possible
