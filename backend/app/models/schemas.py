from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ScreenRequest(BaseModel):
    job_description: str
    resume_text: Optional[str] = None  # used if no file uploaded


class KeywordMatch(BaseModel):
    keyword: str
    found: bool
    context: Optional[str] = None


class ScreenResult(BaseModel):
    match_score: int                    # 0-100
    summary: str                        # 2-3 sentence overall verdict
    strengths: List[str]                # what the resume has that JD wants
    gaps: List[str]                     # what's missing
    keyword_matches: List[KeywordMatch] # per-keyword breakdown
    suggested_improvements: List[str]   # actionable resume tips
    created_at: datetime = datetime.utcnow()


class ErrorResponse(BaseModel):
    detail: str
