# scripts/fetcher.py
import os
from garminconnect import Garmin
from fitdecode import FitReader

def login_to_garmin():
    """Log in to Garmin Connect and return the client."""
    username = os.getenv("GARMIN_USERNAME")
    password = os.getenv("GARMIN_PASSWORD")
    client = Garmin(username, password)
    client.login()
    return client

def parse_fit_file(file_path):
    """Parse .FIT file and extract key metrics."""
    data = {'heart_rate': [], 'distance': 0, 'time': 0}
    try:
        with FitReader(file_path) as fit:
            for frame in fit:
                if frame.name == 'record':
                    if 'heart_rate' in frame.fields:
                        data['heart_rate'].append(frame.get_value('heart_rate'))
                    if 'distance' in frame.fields:
                        data['distance'] = frame.get_value('distance')
                    if 'timestamp' in frame.fields:
                        data['time'] = frame.get_value('timestamp')
    except Exception as e:
        print(f"Error parsing .FIT file {file_path}: {e}")
    return data

def fetch_and_store_fit_files(start_date, end_date):
    """Fetch .FIT files from Garmin and parse them."""
    client = login_to_garmin()
    activities = client.get_activities_by_date(start_date, end_date)
    if not os.path.exists("activities"):
        os.makedirs("activities")
    
    for activity in activities:
        activity_id = activity['activityId']
        fit_path = f"activities/{activity_id}.fit"
        try:
            # Download .FIT file
            fit_data = client.download_activity(activity_id, dl_fmt=client.ActivityDownloadFormat.ORIGINAL)
            with open(fit_path, "wb") as f:
                f.write(fit_data)
            
            # Parse the file
            detailed_data = parse_fit_file(fit_path)
            from database import save_detailed_data
            save_detailed_data(activity_id, detailed_data)
        except Exception as e:
            print(f"Error processing activity {activity_id}: {e}")
        finally:
            if os.path.exists(fit_path):
                os.remove(fit_path)

if __name__ == "__main__":
    from datetime import datetime, timedelta
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    fetch_and_store_fit_files(start_date, end_date)
