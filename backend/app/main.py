import time
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.database.db_client import db
from app.services.gmail_service import gmail_service
from app.agent.adk_agent import adk_engine
from app.agent.action_executor import action_executor
from app.agent.followup_tracker import followup_tracker
from app.webhooks.pubsub import router as pubsub_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend service powering Glossy - Autonomous Session-Based Gmail Agent.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pubsub_router)

# Request Pydantic Schemas
class StartSessionRequest(BaseModel):
    duration_minutes: int = 60

class SimulateEmailRequest(BaseModel):
    subject: str
    sender: str
    body: str

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "active_session": db.get_active_session()
    }

@app.get("/api/session/current")
def get_current_session():
    active = db.get_active_session()
    return {"active_session": active}

@app.post("/api/session/start")
def start_session(req: StartSessionRequest):
    sess = db.start_session(duration_minutes=req.duration_minutes)
    # Register watch with Gmail API
    watch_res = gmail_service.setup_watch(settings.PUBSUB_TOPIC)
    sess["watch_res"] = watch_res
    return {"status": "started", "session": sess}

@app.post("/api/session/end")
def end_session():
    active = db.get_active_session()
    if not active:
        raise HTTPException(status_code=400, detail="No active session to end.")

    session_id = active["session_id"]
    
    # Run Module D: Follow-up tracker for unanswered outbound emails
    followups = followup_tracker.scan_and_generate_followups(session_id)
    
    # Conclude session in DB
    ended_session = db.end_session(session_id)
    
    # Gather session data for Executive Briefing Report
    actions = db.get_mail_actions(session_id=session_id)
    commitments = [c for c in db.get_commitments() if c.get("session_id") == session_id]

    report = {
        "session_id": session_id,
        "duration_minutes": ended_session.get("duration_minutes"),
        "started_at": ended_session.get("start_time"),
        "ended_at": ended_session.get("end_time"),
        "metrics": {
            "total_triaged": len(actions),
            "auto_sent": len([a for a in actions if a.get("action") == "auto_sent"]),
            "drafted_for_review": len([a for a in actions if a.get("action") in ["flagged_for_review", "drafted", "flagged"]]),
            "commitments_logged": len(commitments),
            "followups_generated": len(followups)
        },
        "mail_summary": actions,
        "commitments": commitments,
        "followups": followups
    }

    return {"status": "completed", "report": report}

@app.get("/api/activity")
def get_activity():
    actions = db.get_mail_actions(limit=30)
    return {"activity": actions}

@app.get("/api/commitments")
def get_commitments():
    commitments = db.get_commitments(limit=30)
    return {"commitments": commitments}

@app.post("/api/simulate")
def simulate_email(req: SimulateEmailRequest):
    active_session = db.get_active_session()
    if not active_session:
        # Auto start a 60 min session if none active for convenient testing
        active_session = db.start_session(duration_minutes=60)

    mail_id = f"sim_{int(time.time())}"
    email_data = {
        "id": mail_id,
        "thread_id": f"thread_{mail_id}",
        "subject": req.subject,
        "from": req.sender,
        "to": "me@glossy.ai",
        "snippet": req.body[:120],
        "date": time.strftime("%a, %d %b %Y %H:%M:%S GMT"),
        "body": req.body
    }

    thread_context = gmail_service.fetch_thread(email_data["thread_id"])
    triage_res = adk_engine.triage_email(email_data, thread_context)
    action_doc = action_executor.process_email(
        email_data=email_data,
        triage_result=triage_res,
        session_id=active_session["session_id"]
    )

    return {
        "status": "success",
        "email": email_data,
        "triage": triage_res,
        "action": action_doc
    }
