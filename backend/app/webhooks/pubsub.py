import base64
import json
from fastapi import APIRouter, HTTPException, Request
from app.database.db_client import db
from app.services.gmail_service import gmail_service
from app.agent.adk_agent import adk_engine
from app.agent.action_executor import action_executor

router = APIRouter(prefix="/webhook", tags=["webhooks"])

@router.post("/gmail-pubsub")
async def handle_gmail_pubsub(request: Request):
    """Event-Driven GCP Pub/Sub Push Endpoint for Gmail users.watch()."""
    # 1. Gatekeeper Check: Is an active busy session declared?
    active_session = db.get_active_session()
    if not active_session:
        print("[PubSub Webhook]: Notification received, but Glossy is sleeping (No active busy session).")
        return {"status": "ignored", "reason": "No active session"}

    try:
        body = await request.json()
        message = body.get("message", {})
        data_b64 = message.get("data", "")
        if data_b64:
            decoded_str = base64.b64decode(data_b64).decode("utf-8")
            payload = json.loads(decoded_str)
            history_id = payload.get("historyId")
            email_address = payload.get("emailAddress", "me")
            print(f"[PubSub Webhook Event]: New email trigger for {email_address}, historyId={history_id}")
            
            # Fetch email item details
            email_data = gmail_service.fetch_message(f"msg_pubsub_{history_id}")
            thread_context = gmail_service.fetch_thread(email_data.get("thread_id", "default_thread"))

            # ADK Gemini Triage
            triage_res = adk_engine.triage_email(email_data, thread_context)
            
            # Action Execution with Safety Guardrails
            action_doc = action_executor.process_email(
                email_data=email_data,
                triage_result=triage_res,
                session_id=active_session["session_id"]
            )
            return {"status": "processed", "action": action_doc}
    except Exception as e:
        print(f"[PubSub Webhook Error]: {e}")
        # Return 200 to acknowledge Pub/Sub delivery even on processing error to avoid endless retry loops
        return {"status": "error", "message": str(e)}

    return {"status": "received"}
