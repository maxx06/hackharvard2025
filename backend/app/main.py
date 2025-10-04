from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from app.core.config import settings
from openai import OpenAI
from dotenv import load_dotenv
import os
import tempfile

# --- Load environment variables from .env ---
load_dotenv()

# --- Create FastAPI app only once ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize OpenAI client using key from environment ---
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- Include any other routers you already have ---
app.include_router(api_router, prefix=settings.API_V1_STR)


# ---------- Basic routes ----------
@app.get("/")
async def root():
    return {"message": "Welcome to HackHarvard 2025 API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ---------- Whisper Transcription Route ----------
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )

        return {"text": transcript.text}
    except Exception as e:
        print("Transcription error:", e)
        return {"error": str(e)}