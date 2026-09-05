from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BugReportRequest(BaseModel):
    """Request model for bug report enhancement"""
    title: str
    description: str
    environment: Dict[str, Any]
    console_errors: Optional[List[str]] = []
    failed_requests: Optional[List[Dict[str, Any]]] = []

class EnhancedBugReport(BaseModel):
    """Model for AI-enhanced bug report"""
    enhanced_title: str
    enhanced_description: str
    severity_suggestion: str
    environment_summary: str
    suggested_tags: List[str]
    reproduction_steps: Optional[List[str]] = []