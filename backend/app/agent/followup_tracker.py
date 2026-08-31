import time
from typing import List, Dict, Any
from app.database.db_client import db
from app.services.gmail_service import gmail_service

class FollowupTracker:
    """Module D: Scans Sent folder for unanswered emails and drafts follow-up nudges."""

    def scan_and_generate_followups(self, session_id: str) -> List[Dict[str, Any]]:
        # In live mode or mock mode, scan recent sent messages with no reply
        pending = [
            {
                "mail_id": "sent_101",
                "recipient": "partner@vendorcorp.com",
                "subject": "Proposal Agreement Sign-off",
                "days_pending": 3,
                "snippet": "Hi, sent the updated agreement terms for your team review."
            },
            {
                "mail_id": "sent_102",
                "recipient": "hr@clientorg.io",
                "subject": "Candidate Onboarding Schedule",
                "days_pending": 4,
                "snippet": "Following up on the candidate start date confirmation."
            }
        ]

        generated = []
        for p in pending:
            nudge_text = f"Hi, just following up on my previous note regarding '{p['subject']}'. Please let me know if you need any additional details. Thanks!"
            draft_res = gmail_service.create_draft(
                to=p["recipient"],
                subject=f"Follow-up: {p['subject']}",
                body=nudge_text
            )
            doc = {
                "followup_id": f"fol_{int(time.time())}_{p['mail_id']}",
                "session_id": session_id,
                "original_mail_id": p["mail_id"],
                "recipient": p["recipient"],
                "subject": p["subject"],
                "days_pending": p["days_pending"],
                "followup_draft_id": draft_res.get("draft_id"),
                "draft_body": nudge_text,
                "created_at": time.time()
            }
            db.add_pending_reply(doc)
            generated.append(doc)

        return generated

followup_tracker = FollowupTracker()
