from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.schemas import ScreenResult
from app.services.parser import extract_text_from_file
from app.services.screener import analyze_resume

router = APIRouter()


@router.post("/screen", response_model=ScreenResult)
async def screen_resume(
    job_description: str = Form(...),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
):
    """
    Screen a resume against a job description.
    Accepts either a file upload (PDF/TXT) or raw pasted text.
    """
    if not resume_file and not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Provide either a resume file or resume text."
        )

    if not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    # Extract text
    if resume_file:
        text = await extract_text_from_file(resume_file)
    else:
        text = resume_text

    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short. Please provide a complete resume."
        )

    try:
        result = await analyze_resume(
            resume_text=text,
            job_description=job_description
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return result


@router.get("/screen/example")
async def get_example():
    """Returns example JD and resume text for testing the frontend."""
    return {
        "job_description": """Software Engineer - Backend (Python)
        
We are looking for a backend engineer with:
- 2+ years Python experience
- FastAPI or Django REST framework
- PostgreSQL and Redis
- Docker and Kubernetes
- Experience with REST APIs
- Git and CI/CD pipelines
- Bonus: experience with LLMs or AI APIs
""",
        "resume_text": """John Doe | john@example.com | github.com/johndoe

SKILLS
Python, FastAPI, Flask, PostgreSQL, MySQL, Git, Docker, REST APIs, Linux

EXPERIENCE
Backend Developer — Startup XYZ (2022–2024)
- Built REST APIs using FastAPI serving 50k daily requests
- Managed PostgreSQL databases and wrote complex queries
- Containerized services using Docker

EDUCATION
B.Tech Computer Science — 2022
"""
    }
