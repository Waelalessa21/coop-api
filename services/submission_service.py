from models.submission import SubmissionData
from typing import Dict, Any, List
import uuid
import json
import os
from datetime import datetime

class SubmissionService:
    def __init__(self):
        self.submissions: Dict[str, SubmissionData] = {}
        self.data_file = "data/submissions.json"
        self._load_data()
    
    def create_submission(self, submission_data: SubmissionData) -> Dict[str, Any]:
        submission_id = str(uuid.uuid4())
        submission_data.submissionDate = datetime.now()
        submission_data.status = "pending"
        
        self.submissions[submission_id] = submission_data
        self._save_data()
        
        return {
            "id": submission_id,
            "status": "success",
            "message": "Submission created successfully",
            "submissionDate": submission_data.submissionDate.isoformat()
        }
    
    def get_submission(self, submission_id: str) -> Dict[str, Any]:
        if submission_id not in self.submissions:
            return {"error": "Submission not found"}
        
        submission = self.submissions[submission_id]
        return {
            "id": submission_id,
            "data": submission.dict(),
            "status": submission.status
        }
    
    def get_all_submissions(self) -> List[Dict[str, Any]]:
        submissions_list = []
        for submission_id, submission in self.submissions.items():
            submissions_list.append({
                "id": submission_id,
                "name": submission.name,
                "email": submission.email,
                "phone": submission.phone,
                "major": submission.major,
                "submissionDate": submission.submissionDate.isoformat(),
                "status": submission.status,
                "cvUrl": submission.cvUrl
            })
        return submissions_list
    
    def delete_submission(self, submission_id: str) -> Dict[str, Any]:
        if submission_id not in self.submissions:
            return {"error": "Submission not found"}
        
        del self.submissions[submission_id]
        self._save_data()
        
        return {
            "status": "success",
            "message": "Submission deleted successfully"
        }
    
    def _load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for submission_id, submission_data in data.items():
                        self.submissions[submission_id] = SubmissionData(**submission_data)
            except Exception as e:
                print(f"Error loading data: {e}")
    
    def _save_data(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        try:
            data = {}
            for submission_id, submission in self.submissions.items():
                data[submission_id] = submission.dict()
            
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            print(f"Error saving data: {e}")
