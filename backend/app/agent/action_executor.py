import time
from typing import Dict, Any
from app.database.db_client import db
from app.services.gmail_service import gmail_service
from app.config import settings

class ActionExecutor:
    """Module C: Executes autonomous actions with strict safety guardrails."""
    
    def process_email(self, email_data: Dict[str, Any], triage_result: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        classification = triage_result.get("classification", "important")
        reply_needed = triage_result.get("reply_needed", "ambiguous")
        suggested_reply = triage_result.get("suggested_reply", "")
        reasoning = triage_result.get("reasoning", "")
        commitments = triage_result.get("commitments", [])

        mail_id = email_data.get("id", f"mail_{int(time.time())}")
        sender = email_data.get("from", "Unknown")
        subject = email_data.get("subject", "No Subject")

        # --- 1. Log Extracted Commitments ---
        for comm in commitments:
            db.add_commitment({
                "commitment_id": f"comm_{int(time.time())}_{mail_id[-4:]}",
                "mail_id": mail_id,
                "session_id": session_id,
                "owner": comm.get("who", "User"),
                "task": comm.get("owes", "Task"),
                "to": comm.get("to", sender),
                "deadline": comm.get("deadline", "Unspecified"),
                "status": "pending",
                "extracted_at": time.time()
            })

        # --- 2. Enforce Safety Rules ---
        # SAFETY RULE: Important or Ambiguous mail is NEVER auto-sent. Only drafted and flagged!
        action_type = "ignored"
        draft_details = None

        if classification in ["spam", "newsletter"] or reply_needed == "no":
            action_type = "ignored"
        elif classification == "important" or reply_needed == "ambiguous":
            # High stakes or ambiguous -> Gmail Draft ONLY + Flag for Review
            if suggested_reply:
                draft_res = gmail_service.create_draft(
                    to=sender,
                    subject=f"Re: {subject}",
                    body=suggested_reply,
                    thread_id=email_data.get("thread_id")
                )
                draft_details = draft_res
                action_type = "flagged_for_review"
            else:
                action_type = "flagged_for_review"
        elif classification == "low-stakes" and reply_needed == "yes":
            # Low stakes -> Auto-send or Draft based on settings
            if settings.ALLOW_AUTO_SEND:
                send_res = gmail_service.send_email(
                    to=sender,
                    subject=f"Re: {subject}",
                    body=suggested_reply,
                    thread_id=email_data.get("thread_id")
                )
                draft_details = send_res
                action_type = "auto_sent"
            else:
                draft_res = gmail_service.create_draft(
                    to=sender,
                    subject=f"Re: {subject}",
                    body=suggested_reply,
                    thread_id=email_data.get("thread_id")
                )
                draft_details = draft_res
                action_type = "drafted"

        # --- 3. Save Action Document to DB ---
        action_doc = {
            "action_id": f"act_{int(time.time())}_{mail_id[-4:]}",
            "mail_id": mail_id,
            "session_id": session_id,
            "sender": sender,
            "subject": subject,
            "snippet": email_data.get("snippet", ""),
            "classification": classification,
            "reply_needed": reply_needed,
            "action": action_type,
            "reasoning": reasoning,
            "suggested_reply": suggested_reply,
            "draft_details": draft_details,
            "commitments_count": len(commitments),
            "timestamp": time.time(),
            "needs_browser_notification": action_type in ["flagged_for_review", "flagged"] or classification == "important"
        }
        db.add_mail_action(action_doc)
        return action_doc

action_executor = ActionExecutor()
