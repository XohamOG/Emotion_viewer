import firebase_admin
from firebase_admin import credentials, db
import json

# Initialize Firebase (Ensure you have the credentials JSON file)
cred = credentials.Certificate("path/to/firebase-credentials.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://your-database-name.firebaseio.com/"
})

def upload_data_to_firebase(data, path="healthReports"):
    """
    Uploads JSON data to Firebase Realtime Database
    """
    ref = db.reference(path)
    ref.set(data)  # Upload JSON data
    print("Data successfully uploaded to Firebase.")

# Load local JSON file and upload it
with open("data/medications.json", "r") as f:
    data = json.load(f)
    upload_data_to_firebase(data)
