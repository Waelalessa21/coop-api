from fastapi import APIRouter, HTTPException, status, UploadFile, File
from models.submission import SubmissionData
from services.submission_service import SubmissionService
from typing import Dict, Any, List
import uuid
import os

submission_router = APIRouter()
submission_service = SubmissionService()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@submission_router.post("/submissions", response_model=Dict[str, Any])
async def create_submission(submission_data: SubmissionData):
    try:
        result = submission_service.create_submission(submission_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create submission: {str(e)}"
        )

@submission_router.get("/submissions/{submission_id}", response_model=Dict[str, Any])
async def get_submission(submission_id: str):
    result = submission_service.get_submission(submission_id)
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"]
        )
    return result


@submission_router.get("/submissions", response_model=List[Dict[str, Any]])
async def get_all_submissions():
    result = submission_service.get_all_submissions()
    return result

@submission_router.post("/upload", response_model=Dict[str, Any])
async def upload_file(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        file_url = f"/uploads/{filename}"
        
        return {
            "id": file_id,
            "filename": file.filename,
            "url": file_url,
            "size": len(content),
            "type": file.content_type
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )
