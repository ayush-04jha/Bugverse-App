from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.routes import ai_routes

load_dotenv()

app = FastAPI(
    title="BugVerse AI Service",
    description="AI-powered bug analysis and enhancement service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI routes
app.include_router(ai_routes.router)

@app.get("/")
async def root():
    return {
        "service": "BugVerse AI Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "enhance_bug_report": "/api/ai/enhance-bug-report",
            "analyze_environment": "/api/ai/analyze-environment"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)