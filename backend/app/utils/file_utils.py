from typing import Optional
from PyPDF2 import PdfReader
from docx import Document
import aiofiles
from fastapi import UploadFile

async def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    async with aiofiles.open(destination, "wb") as out_file:
        while content := await upload_file.read(1024):  # read in chunks asynchronously
            await out_file.write(content)

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"PDF text extraction error: {e}")
    return text

def extract_text_from_docx(file_path: str) -> str:
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"DOCX text extraction error: {e}")
    return text

def extract_text(file_path: str, filename: str) -> Optional[str]:
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif filename.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)
    elif filename.lower().endswith(".txt"):
        try:
            with open(file_path, encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"TXT file read error: {e}")
            return None
    else:
        # Unsupported file type for automatic extraction
        return None
