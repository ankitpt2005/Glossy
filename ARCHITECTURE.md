# Architecture & Technical Specs — Project Glossy

## Layer-by-Layer System Specs

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant WebApp as Glossy Web App (Vite+React)
    participant FastAPI as FastAPI Session Controller
    participant PubSub as GCP Pub/Sub Push
    participant ADK as Google ADK + Gemini Flash
    participant Gmail as Gmail API
    participant DB as Firestore / Local DB

    User->>WebApp: Click "Start Busy Session (1 hr)"
    WebApp->>FastAPI: POST /api/session/start
    FastAPI->>DB: Write session doc {status: 'active'}
    FastAPI->>Gmail: Call users.watch()
    
    Note over Gmail,PubSub: Incoming Mail Event Occurs
    Gmail->>PubSub: Push event notification
    PubSub->>FastAPI: POST /webhook/gmail-pubsub
    
    FastAPI->>DB: Gatekeeper check: Active Session?
    alt Session Active
        FastAPI->>Gmail: Fetch full message & thread context
        FastAPI->>ADK: Triage email & extract commitments (Gemini Flash)
        ADK-->>FastAPI: Structured JSON (Classification, Reply, Commitments)
        
        alt Important or Ambiguous Mail
            FastAPI->>Gmail: createDraft()
            FastAPI->>DB: Log action 'flagged_for_review'
            FastAPI-->>WebApp: Trigger Browser Notification API
        else Low-Stakes Mail
            FastAPI->>Gmail: autoSend() or createDraft()
            FastAPI->>DB: Log action 'auto_sent'
        end
    else No Active Session
        FastAPI-->>PubSub: Return 200 OK (Agent Sleeping)
    end

    User->>WebApp: Click "End Session"
    WebApp->>FastAPI: POST /api/session/end
    FastAPI->>DB: Query session actions & commitments
    FastAPI-->>WebApp: Deliver Executive Briefing Report
```

## Data Schema (Firestore / DB)

### `sessions`
- `session_id`: String (PK)
- `status`: `'active'` | `'completed'`
- `start_time`: Timestamp
- `duration_minutes`: Number
- `stats`: `{ total_triaged, auto_sent, drafted, flagged, commitments_logged }`

### `mail_actions`
- `action_id`: String (PK)
- `mail_id`: String
- `session_id`: String (FK)
- `sender`: String
- `subject`: String
- `classification`: `'important'` | `'low-stakes'` | `'spam'` | `'newsletter'`
- `reply_needed`: `'yes'` | `'no'` | `'ambiguous'`
- `action`: `'auto_sent'` | `'drafted'` | `'flagged_for_review'` | `'ignored'`
- `reasoning`: String
- `suggested_reply`: String

### `commitments`
- `commitment_id`: String (PK)
- `mail_id`: String
- `session_id`: String
- `owner`: String
- `task`: String
- `to`: String
- `deadline`: String
