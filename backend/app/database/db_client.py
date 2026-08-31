import os
import json
import time
from typing import Dict, List, Optional, Any
from app.config import settings

class MockFirestore:
    """In-memory & file-backed database emulator for zero-dependency local testing."""
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data")
        os.makedirs(self.data_dir, exist_ok=True)
        self.db_file = os.path.join(self.data_dir, "db.json")
        self._load()

    def _load(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, "r") as f:
                    self.store = json.load(f)
            except Exception:
                self.store = {"sessions": {}, "commitments": [], "mail_actions": [], "pending_replies": []}
        else:
            self.store = {"sessions": {}, "commitments": [], "mail_actions": [], "pending_replies": []}

    def _save(self):
        try:
            with open(self.db_file, "w") as f:
                json.dump(self.store, f, indent=2)
        except Exception as e:
            print(f"[DB Save Error]: {e}")

    # --- Session Methods ---
    def get_active_session(self) -> Optional[Dict[str, Any]]:
        for sess in self.store["sessions"].values():
            if sess.get("status") == "active":
                return sess
        return None

    def start_session(self, duration_minutes: int = 60, user_id: str = "user_default") -> Dict[str, Any]:
        # End any existing active session first
        for sess in self.store["sessions"].values():
            if sess.get("status") == "active":
                sess["status"] = "ended"
                sess["end_time"] = time.time()

        session_id = f"sess_{int(time.time())}"
        session_doc = {
            "session_id": session_id,
            "user_id": user_id,
            "status": "active",
            "start_time": time.time(),
            "duration_minutes": duration_minutes,
            "expected_end_time": time.time() + (duration_minutes * 60),
            "stats": {
                "total_triaged": 0,
                "auto_sent": 0,
                "drafted": 0,
                "flagged": 0,
                "commitments_logged": 0
            }
        }
        self.store["sessions"][session_id] = session_doc
        self._save()
        return session_doc

    def end_session(self, session_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        active = self.get_active_session()
        if not active:
            return None
        
        target_id = session_id or active["session_id"]
        sess = self.store["sessions"].get(target_id)
        if sess:
            sess["status"] = "completed"
            sess["end_time"] = time.time()
            self._save()
        return sess

    # --- Mail Actions Methods ---
    def add_mail_action(self, mail_action: Dict[str, Any]):
        self.store["mail_actions"].insert(0, mail_action)
        # Update active session stats
        active = self.get_active_session()
        if active:
            action_type = mail_action.get("action")
            stats = active.get("stats", {})
            stats["total_triaged"] = stats.get("total_triaged", 0) + 1
            if action_type == "auto_sent":
                stats["auto_sent"] = stats.get("auto_sent", 0) + 1
            elif action_type == "drafted":
                stats["drafted"] = stats.get("drafted", 0) + 1
            elif action_type in ["flagged", "flagged_for_review"]:
                stats["flagged"] = stats.get("flagged", 0) + 1
            self.store["sessions"][active["session_id"]]["stats"] = stats
        self._save()

    def get_mail_actions(self, session_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if session_id:
            return [m for m in self.store["mail_actions"] if m.get("session_id") == session_id][:limit]
        return self.store["mail_actions"][:limit]

    # --- Commitment Methods ---
    def add_commitment(self, commitment: Dict[str, Any]):
        self.store["commitments"].insert(0, commitment)
        active = self.get_active_session()
        if active:
            stats = active.get("stats", {})
            stats["commitments_logged"] = stats.get("commitments_logged", 0) + 1
            self.store["sessions"][active["session_id"]]["stats"] = stats
        self._save()

    def get_commitments(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.store["commitments"][:limit]

    # --- Pending Replies Methods ---
    def add_pending_reply(self, pending: Dict[str, Any]):
        self.store["pending_replies"].insert(0, pending)
        self._save()

    def get_pending_replies(self) -> List[Dict[str, Any]]:
        return self.store["pending_replies"]

db = MockFirestore()
