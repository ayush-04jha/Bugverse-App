from fastapi import APIRouter, HTTPException
from app.models.bug_report import BugReportRequest, EnhancedBugReport
from app.services.ai_service import BugAnalysisService

router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])
ai_service = BugAnalysisService()

@router.post("/enhance-bug-report", response_model=EnhancedBugReport)
async def enhance_bug_report(request: BugReportRequest):
    """
    Enhance bug report using AI analysis.
    Takes basic bug information and environment data,
    returns enhanced bug report with better title, description,
    severity suggestion, and reproduction steps.
    """
    try:
        # Convert Pydantic models to dicts for processing
        environment_dict = request.environment.model_dump()
        console_errors = request.console_errors if request.console_errors else []
        failed_requests = request.failed_requests if request.failed_requests else []
        
        # Call AI service
        enhanced_data = ai_service.enhance_bug_report(
            title=request.title,
            description=request.description,
            environment_data=environment_dict,
            console_errors=console_errors,
            failed_requests=failed_requests
        )
        
        return EnhancedBugReport(**enhanced_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@router.post("/analyze-environment")
async def analyze_environment(environment_data: dict):
    """
    Analyze environment data and generate a summary.
    """
    try:
        summary = ai_service.analyze_environment(environment_data)
        return {"environment_summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Environment analysis failed: {str(e)}")