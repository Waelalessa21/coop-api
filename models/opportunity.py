from datetime import datetime
from pydantic import BaseModel, Field


class OpportunityData(BaseModel):
    field: str = Field(..., min_length=1, max_length=150)
    description: str = Field(..., min_length=1, max_length=2000)
    expected_tasks: str = Field(..., min_length=1, max_length=2000)
    created_at: datetime = Field(default_factory=datetime.now)

