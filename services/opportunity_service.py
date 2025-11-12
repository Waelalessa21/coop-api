import json
import os
import uuid
from typing import Any, Dict, List
from datetime import datetime

from models.opportunity import OpportunityData


class OpportunityService:
    def __init__(self):
        self.opportunities: Dict[str, OpportunityData] = {}
        self.data_file = "data/opportunities.json"
        self._load_data()

    def create_opportunity(self, opportunity_data: OpportunityData) -> Dict[str, Any]:
        opportunity_id = str(uuid.uuid4())
        opportunity_data.created_at = datetime.now()

        self.opportunities[opportunity_id] = opportunity_data
        self._save_data()

        return {
            "id": opportunity_id,
            "status": "success",
            "message": "Opportunity created successfully",
            "created_at": opportunity_data.created_at.isoformat()
        }

    def get_opportunity(self, opportunity_id: str) -> Dict[str, Any]:
        if opportunity_id not in self.opportunities:
            return {"error": "Opportunity not found"}

        opportunity = self.opportunities[opportunity_id]
        return {
            "id": opportunity_id,
            "data": opportunity.dict()
        }

    def get_all_opportunities(self) -> List[Dict[str, Any]]:
        opportunities_list = []
        for opportunity_id, opportunity in self.opportunities.items():
            opportunities_list.append({
                "id": opportunity_id,
                "field": opportunity.field,
                "description": opportunity.description,
                "expected_tasks": opportunity.expected_tasks,
                "created_at": opportunity.created_at.isoformat()
            })
        return opportunities_list

    def _load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for opportunity_id, opportunity_data in data.items():
                        self.opportunities[opportunity_id] = OpportunityData(**opportunity_data)
            except Exception as e:
                print(f"Error loading opportunities data: {e}")

    def _save_data(self):
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        try:
            data = {}
            for opportunity_id, opportunity in self.opportunities.items():
                data[opportunity_id] = opportunity.dict()

            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            print(f"Error saving opportunities data: {e}")

