# Project Glossy — Autonomous Session-Based Gmail Agent

> **Tagline:** *"Tell it you're busy. Come back to it done."*

Built for the **All Things Agentic Hackathon (Taskmaster Track)** powered by **Google ADK**, **Gemini 3.5+ (`gemini-flash-latest`)**, **Gmail API `users.watch()`**, **Google Cloud Pub/Sub**, and **Firestore**.

---

## 🌟 Overview & Operational Utility

When you are busy (watching a movie, studying, in high-stakes client meetings), emails go unattended — critical requests get missed, commitments are forgotten, and unanswered outbound mails stall workflows. 

**Glossy** is a session-based autonomous Gmail agent:
1. Declare a busy session duration via the **Glossy Minimalist Web App**.
2. Glossy monitors incoming emails via **Gmail API Pub/Sub push notifications** (true event-driven, zero polling delay).
3. The **Google ADK & Gemini Flash Brain** triages every mail in context, extracts commitments, auto-replies to low-stakes items, and creates drafts flagged for review for important/ambiguous requests.
4. **Native Browser Notification API** alerts you instantly on desktop for high-stakes items.
5. At session end, Glossy delivers a consolidated **Executive Session Briefing**.

---

## 🛡️ Safety By Design (Taskmaster Guardrails)

- **Strict Auto-Send Policy:** `Important` or `Ambiguous` emails are **NEVER** auto-sent. They are created as Gmail Drafts, flagged in Firestore, and surfaced in the Activity Center for manual review.
- **Low-Stakes Auto-Reply:** Casual invitations, routine scheduling, or non-critical check-ins generate polite response drafts or auto-replies.
- **Commitment Extraction:** Gemini continuously pulls `{who, owes, to, deadline}` from thread history into the Commitment Tracker.

---

## 🎨 Design System & Aesthetics

- **Minimalist Aesthetic:** Clean, spacious visual layout with generous whitespace, subtle borders, high functional contrast, crisp Inter typography, and glowing state indicators.
- **Locked Palette Tokens:**
  - Obsidian Base Surface: `#191919`
  - Slate Navy Accent: `#2B3F55`
  - Sage Mint Status & Highlight: `#DDEBE5`
  - Cool Slate Card Surface: `#D6DEE1`
  - Light Grey Borders & Dividers: `#E6E6E6`
  - Off-White Primary Text: `#F1F1F1`

---

## 🚀 Quick Start & Local Execution

### 1. Install Backend Dependencies & Run FastAPI
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Install Frontend Dependencies & Run Vite Dashboard
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

### 3. Demo Simulator
Use the **Interactive Demo Email Injector** panel inside the Glossy Web App to trigger sample emails (Urgent Client Request, Casual Lunch Invite, Ambiguous Contract Clause) and observe real-time triage, desktop browser alerts, and commitment logging!
