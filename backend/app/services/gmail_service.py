import os
import time
import base64
from typing import Dict, List, Any, Optional
from email.mime.text import MIMEText

class GmailService:
    """Gmail API integration wrapper with live OAuth & local mock simulation support."""
    def __init__(self):
        self.mock_mode = True
        self.service = None
        self._init_client()

    def _init_client(self):
        # Attempt to load Google OAuth credentials if available
        cred_path = os.getenv("GMAIL_CREDENTIALS_PATH", "credentials.json")
        token_path = os.getenv("GMAIL_TOKEN_PATH", "token.json")
        if os.path.exists(cred_path) and os.path.exists(token_path):
            try:
                from google.oauth2.credentials import Credentials
                from googleapiclient.discovery import build
                creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/gmail.modify'])
                self.service = build('gmail', 'v1', credentials=creds)
                self.mock_mode = False
                print("[GmailService]: Connected to live Gmail API.")
            except Exception as e:
                print(f"[GmailService]: Live client setup failed ({e}). Falling back to Mock Mode.")

    def fetch_message(self, message_id: str) -> Dict[str, Any]:
        """Fetch details of a single message."""
        if not self.mock_mode and self.service:
            try:
                res = self.service.users().messages().get(userId='me', id=message_id, format='full').execute()
                headers = {h['name'].lower(): h['value'] for h in res.get('payload', {}).get('headers', [])}
                snippet = res.get('snippet', '')
                return {
                    "id": message_id,
                    "thread_id": res.get("threadId"),
                    "subject": headers.get("subject", "No Subject"),
                    "from": headers.get("from", "Unknown"),
                    "to": headers.get("to", ""),
                    "snippet": snippet,
                    "date": headers.get("date", ""),
                    "body": snippet
                }
            except Exception as e:
                print(f"[Gmail API Error]: {e}")
        
        # Mock fallback response
        return {
            "id": message_id,
            "thread_id": f"thread_{message_id}",
            "subject": f"Simulated Subject for {message_id}",
            "from": "alex.client@enterprise.com",
            "to": "me@glossy.ai",
            "snippet": "This is a simulated message snippet for testing.",
            "date": time.strftime("%a, %d %b %Y %H:%M:%S GMT"),
            "body": "Hi, checking on the quarterly deliverable status. Can you confirm by 5 PM today?"
        }

    def fetch_thread(self, thread_id: str) -> List[Dict[str, Any]]:
        """Fetch full thread history for context extraction."""
        if not self.mock_mode and self.service:
            try:
                res = self.service.users().threads().get(userId='me', id=thread_id).execute()
                messages = res.get('messages', [])
                parsed = []
                for m in messages:
                    headers = {h['name'].lower(): h['value'] for h in m.get('payload', {}).get('headers', [])}
                    parsed.append({
                        "id": m.get("id"),
                        "from": headers.get("from", "Unknown"),
                        "snippet": m.get("snippet", ""),
                        "date": headers.get("date", "")
                    })
                return parsed
            except Exception as e:
                print(f"[Gmail Thread Fetch Error]: {e}")

        return [
            {
                "id": f"msg_old_{thread_id}",
                "from": "me@glossy.ai",
                "snippet": "Hi Alex, we are working on the draft metrics now.",
                "date": "Yesterday"
            },
            {
                "id": f"msg_new_{thread_id}",
                "from": "alex.client@enterprise.com",
                "snippet": "Thanks. Please confirm the final deadline and budget approval.",
                "date": "10 mins ago"
            }
        ]

    def create_draft(self, to: str, subject: str, body: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a Gmail Draft."""
        if not self.mock_mode and self.service:
            try:
                message = MIMEText(body)
                message['to'] = to
                message['subject'] = subject
                raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
                body_dict = {'message': {'raw': raw}}
                if thread_id:
                    body_dict['message']['threadId'] = thread_id
                draft = self.service.users().drafts().create(userId='me', body=body_dict).execute()
                return {"draft_id": draft.get("id"), "status": "created_in_gmail"}
            except Exception as e:
                print(f"[Gmail Draft Create Error]: {e}")

        draft_id = f"draft_{int(time.time())}"
        print(f"[Gmail Mock Draft Created]: ID={draft_id} To={to} Subj='{subject}'")
        return {"draft_id": draft_id, "status": "mock_draft_created"}

    def send_email(self, to: str, subject: str, body: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
        """Send an email immediately (used for low-stakes auto-replies)."""
        if not self.mock_mode and self.service:
            try:
                message = MIMEText(body)
                message['to'] = to
                message['subject'] = subject
                raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
                body_dict = {'raw': raw}
                if thread_id:
                    body_dict['threadId'] = thread_id
                sent = self.service.users().messages().send(userId='me', body=body_dict).execute()
                return {"message_id": sent.get("id"), "status": "sent_via_gmail"}
            except Exception as e:
                print(f"[Gmail Send Error]: {e}")

        msg_id = f"sent_{int(time.time())}"
        print(f"[Gmail Mock Auto-Sent Email]: ID={msg_id} To={to} Subj='{subject}'")
        return {"message_id": msg_id, "status": "mock_sent"}

    def setup_watch(self, topic_name: str) -> Dict[str, Any]:
        """Register Gmail users.watch() to GCP Pub/Sub topic."""
        if not self.mock_mode and self.service:
            try:
                req = {
                    'topicName': topic_name,
                    'labelIds': ['INBOX']
                }
                res = self.service.users().watch(userId='me', body=req).execute()
                return {"status": "active", "historyId": res.get("historyId"), "expiration": res.get("expiration")}
            except Exception as e:
                print(f"[Gmail watch() Setup Error]: {e}")

        print(f"[Gmail Mock Watch Activated]: Topic={topic_name}")
        return {"status": "mock_active", "historyId": "999999", "expiration": str(int(time.time()*1000) + 86400000)}

gmail_service = GmailService()
