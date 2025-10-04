# HackHarvard 2025

## Project Structure

```
hackharvard2025/
├── frontend/          # Next.js + shadcn/ui
│   ├── src/
│   │   ├── app/      # Next.js app directory
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── types/
│   └── public/
└── backend/          # Python + FastAPI
    ├── app/
    │   ├── api/      # API routes
    │   ├── core/     # Configuration
    │   ├── models/   # Data models
    │   ├── schemas/  # Pydantic schemas
    │   └── services/ # Business logic
    └── tests/
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000
API docs available at http://localhost:8000/docs

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, FastAPI, Pydantic
