import io
from fastapi import UploadFile, HTTPException


async def extract_text_from_file(file: UploadFile) -> str:
    """
    Extract plain text from an uploaded file.
    Supports: .pdf, .txt
    Week 2 upgrade: add .docx support via python-docx
    """
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".txt"):
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Could not decode text file. Ensure it is UTF-8.")

    elif filename.endswith(".pdf"):
        try:
            import pdfplumber
            text_parts = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            full_text = "\n".join(text_parts).strip()
            if not full_text:
                raise HTTPException(status_code=400, detail="PDF appears to be scanned or image-only. Please upload a text-based PDF.")
            return full_text
        except ImportError:
            raise HTTPException(status_code=500, detail="PDF parsing library not installed. Run: pip install pdfplumber")

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {filename}. Supported: .pdf, .txt"
        )
