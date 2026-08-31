import json
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from app.config import settings

class ADKGlossyEngine:
    """Google ADK & Gemini 3.5+ Triage Engine using gemini-flash-latest."""
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        self._init_genai()

    def _init_genai(self):
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                print(f"[ADKGlossyEngine]: Gemini Client initialized with model '{self.model_name}'.")
            except Exception as e:
                print(f"[ADKGlossyEngine Setup Error]: {e}. Using fallback rule engine.")

    def triage_email(self, email_data: Dict[str, Any], thread_context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Module B: Classify email, decide reply necessity, extract commitments, generate reply draft."""
        prompt = f"""
You are Glossy, an autonomous executive assistant triaging an incoming email during an active busy session.

Incoming Email Details:
Subject: {email_data.get('subject', 'No Subject')}
From: {email_data.get('from', 'Unknown')}
To: {email_data.get('to', '')}
Snippet: {email_data.get('snippet', '')}
Body Content: {email_data.get('body', '')}

Thread History:
{json.dumps(thread_context, indent=2)}

Task Guidelines:
1. Classify importance:
   - "important": Urgent business requests, high-value clients, financial/budget inquiries, critical deadlines, executive decisions.
   - "low-stakes": Casual lunch/coffee invites, simple thank you notes, routine scheduling check-ins, non-urgent FYIs.
   - "spam": Marketing, promotional, junk.
   - "newsletter": Automated updates, digests.

2. Determine reply necessity:
   - "yes": Clear question or action requested.
   - "no": Informational only or newsletter/spam.
   - "ambiguous": Unclear intent, complex contract/legal wording, sensitive feedback, or requiring human judgment.

3. Extract commitments:
   - Identify any promises, deliverables, tasks, or deadlines mentioned in the email/thread.
   - Extract format: array of objects {{ "who": string, "owes": string, "to": string, "deadline": string }}

4. Generate suggested reply:
   - If reply_needed is "yes" or "ambiguous", compose a professional, concise, polite response draft.

Return ONLY a valid JSON object matching this schema:
{{
  "classification": "important" | "low-stakes" | "spam" | "newsletter",
  "reply_needed": "yes" | "no" | "ambiguous",
  "reasoning": "Brief 1-2 sentence explanation of your judgment",
  "suggested_reply": "Generated email body draft or null",
  "commitments": [
     {{
       "who": "Person responsible",
       "owes": "Task or deliverable",
       "to": "Recipient of deliverable",
       "deadline": "Deadline date/time or 'Unspecified'"
     }}
  ]
}}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                text = response.text.strip()
                parsed = json.loads(text)
                return parsed
            except Exception as e:
                print(f"[Gemini ADK Execution Warning]: {e}. Using deterministic fallback engine.")

        # Deterministic fallback engine for testing without API keys
        subject = email_data.get('subject', '').lower()
        body = email_data.get('body', '').lower()
        snippet = email_data.get('snippet', '').lower()
        combined = f"{subject} {body} {snippet}"

        if any(w in combined for w in ["urgent", "budget", "invoice", "client", "contract", "deadline", "emergency", "quarterly"]):
            classification = "important"
            reply_needed = "yes"
            reasoning = "High-priority inquiry mentioning critical business/financial keywords."
            suggested = f"Hi,\n\nI have received your email regarding '{email_data.get('subject')}' and am currently in a focus session. I will review the details thoroughly and get back to you shortly.\n\nBest regards,"
            commitments = [{
                "who": "User (Glossy Owner)",
                "owes": f"Review {email_data.get('subject')}",
                "to": email_data.get('from'),
                "deadline": "Today 5:00 PM"
            }]
        elif any(w in combined for w in ["lunch", "coffee", "thanks", "casual", "meetup", "awesome"]):
            classification = "low-stakes"
            reply_needed = "yes"
            reasoning = "Casual social invitation or routine low-stakes check-in."
            suggested = "Hi! Sounds great. Let me check my schedule once I finish my current session and confirm shortly. Thanks!"
            commitments = []
        elif any(w in combined for w in ["unsubscribe", "sale", "newsletter", "offer", "discount"]):
            classification = "newsletter"
            reply_needed = "no"
            reasoning = "Automated promotional broadcast."
            suggested = ""
            commitments = []
        else:
            classification = "important"
            reply_needed = "ambiguous"
            reasoning = "Unclear inquiry parameters requiring manual executive review."
            suggested = f"Hi,\n\nThank you for reaching out regarding '{email_data.get('subject')}'. I will check the context and reply as soon as my focus session completes.\n\nRegards,"
            commitments = []

        return {
            "classification": classification,
            "reply_needed": reply_needed,
            "reasoning": reasoning,
            "suggested_reply": suggested,
            "commitments": commitments
        }

adk_engine = ADKGlossyEngine()
