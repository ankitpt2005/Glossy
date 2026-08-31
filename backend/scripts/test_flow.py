import sys
import os
import time
import json

# Ensure UTF-8 output for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.main import start_session, end_session, simulate_email, StartSessionRequest, SimulateEmailRequest
from app.database.db_client import db

def run_test():
    print("=== 1. Starting Busy Session (60 Mins) ===")
    start_res = start_session(StartSessionRequest(duration_minutes=60))
    print(f"Session Started: {start_res['session']['session_id']}\n")

    # Test Scenarios
    test_emails = [
        SimulateEmailRequest(
            sender="alex.client@enterprise.com",
            subject="Urgent: Q3 Budget Sign-off Required",
            body="Hi team, checking on the quarterly budget sign-off. Can you confirm approval by 5 PM today?"
        ),
        SimulateEmailRequest(
            sender="sarah.colleague@techcorp.org",
            subject="Lunch today at 1 PM?",
            body="Hey! Grab lunch at the bistro near office at 1 PM today?"
        ),
        SimulateEmailRequest(
            sender="legal@vendor.net",
            subject="Clause 4.2 Indemnity Revision",
            body="Regarding the indemnification amendment, please review section 4.2 and let us know your stance on liabilities."
        )
    ]

    print("=== 2. Simulating Incoming Emails Triage & Extraction ===")
    for idx, em in enumerate(test_emails, 1):
        res = simulate_email(em)
        action = res["action"]
        triage = res["triage"]
        print(f"Email #{idx}: '{em.subject}'")
        print(f"  |-- Classification : {triage.get('classification')}")
        print(f"  |-- Reply Needed   : {triage.get('reply_needed')}")
        print(f"  |-- Action Taken   : {action.get('action')}")
        print(f"  |-- Reasoning      : {triage.get('reasoning')}")
        print(f"  +-- Commitments    : {len(triage.get('commitments', []))} logged")
        print("-" * 50)

    print("\n=== 3. Ending Session & Compiling Executive Briefing ===")
    end_res = end_session()
    report = end_res["report"]
    print("Session Briefing Report Metrics:")
    print(json.dumps(report["metrics"], indent=2))
    print(f"\nExtracted Commitments ({len(report['commitments'])}):")
    for c in report["commitments"]:
        print(f"  * [{c['owner']} -> {c['to']}] {c['task']} (Deadline: {c['deadline']})")
    print(f"\nFollow-ups Generated ({len(report['followups'])}):")
    for f in report["followups"]:
        print(f"  * To: {f['recipient']} - Subj: '{f['subject']}'")

    print("\n[SUCCESS]: End-to-End Autonomous Agent Test Completed Successfully!")

if __name__ == "__main__":
    run_test()
