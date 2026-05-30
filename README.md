# ResumeMatch — AI Resume Screener

Upload or paste a resume + job description → get an AI-powered match score, keyword analysis, gaps, and improvement tips.

Built with **FastAPI + Claude API + React**. Deployable on Railway/Render in minutes.

---

## Folder structure

```
resume-screener/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # API endpoints
│   │   ├── core/
│   │   │   └── config.py          # Settings / env vars
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── parser.py          # PDF/text extraction
│   │   │   └── screener.py        # Claude API call + response parsing
│   │   └── main.py                # FastAPI app entry point
│   ├── tests/
│   │   └── test_routes.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Full UI (single component for simplicity)
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Setup (local)

### 1. Get your Anthropic API key
Sign up at https://console.anthropic.com and create an API key.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:3000
```

### 4. Docker (alternative)

```bash
# From project root
docker-compose up --build
```

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/screen` | Screen a resume (form-data: job_description + resume_file or resume_text) |
| GET | `/api/v1/screen/example` | Get sample JD + resume for testing |
| GET | `/health` | Health check |

---

## Week 2 upgrades (suggested)

- [ ] Add PostgreSQL to store past screenings
- [ ] Add Redis for caching repeated JD+resume combos  
- [ ] Add async background tasks for long-running analysis
- [ ] Add `.docx` support via `python-docx`

## Week 3 upgrades (suggested)

- [ ] JWT authentication (protect endpoints)
- [ ] Rate limiting per user
- [ ] Deploy to Railway / Render
- [ ] Add a history page showing past analyses

---

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, FastAPI |
| AI | Anthropic Claude API (claude-sonnet-4) |
| PDF parsing | pdfplumber |
| Frontend | React 18, Vite |
| Deploy | Docker, Railway / Render |
