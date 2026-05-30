import json
from groq import Groq
from app.core.config import settings
from app.models.schemas import ScreenResult, KeywordMatch


SYSTEM_PROMPT = """You are an expert technical recruiter and resume analyst.
Your job is to compare a candidate's resume against a job description and provide
an honest, structured analysis.

Always respond with ONLY a valid JSON object — no markdown, no explanation, just raw JSON.
"""

USER_PROMPT_TEMPLATE = """
Analyze this resume against the job description below.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Return a JSON object with EXACTLY this structure:
{{
  "match_score": <integer 0-100>,
  "summary": "<2-3 sentences: overall verdict>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "keyword_matches": [
    {{"keyword": "<keyword from JD>", "found": true/false, "context": "<where found or null>"}}
  ],
  "suggested_improvements": ["<tip 1>", "<tip 2>", "<tip 3>"]
}}

Rules:
- keyword_matches must cover ALL major technical skills from the JD
- Be honest with match_score
- Return ONLY the JSON object, nothing else
"""


async def analyze_resume(resume_text: str, job_description: str) -> ScreenResult:
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = USER_PROMPT_TEMPLATE.format(
        job_description=job_description.strip(),
        resume_text=resume_text.strip()
    )

    message = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=1500,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )

    raw = message.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {e}\nRaw: {raw[:300]}")

    keyword_matches = [
        KeywordMatch(
            keyword=k["keyword"],
            found=k["found"],
            context=k.get("context")
        )
        for k in data.get("keyword_matches", [])
    ]

    return ScreenResult(
        match_score=data["match_score"],
        summary=data["summary"],
        strengths=data.get("strengths", []),
        gaps=data.get("gaps", []),
        keyword_matches=keyword_matches,
        suggested_improvements=data.get("suggested_improvements", [])
    )