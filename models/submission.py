from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SubmissionData(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    phone: str = Field(..., min_length=10, max_length=20)
    major: str = Field(..., min_length=1, max_length=100)
    additional: Optional[str] = Field(None, max_length=1000)
    cvUrl: str = Field(..., min_length=1)
    submissionDate: datetime = Field(default_factory=datetime.now)
    status: str = Field(default="pending", max_length=50)
