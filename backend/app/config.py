import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Project Glossy - Autonomous Gmail Agent"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    
    # GCP Config
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "project-glossy-demo")
    PUBSUB_TOPIC: str = os.getenv("PUBSUB_TOPIC", "gmail-updates")
    GMAIL_USER_ID: str = os.getenv("GMAIL_USER_ID", "me")
    
    # Storage Mode: 'firestore' or 'mock'
    USE_FIRESTORE: bool = os.getenv("USE_FIRESTORE", "false").lower() == "true"
    
    # Auto-send switch for low stakes emails
    ALLOW_AUTO_SEND: bool = os.getenv("ALLOW_AUTO_SEND", "true").lower() == "true"

settings = Settings()
