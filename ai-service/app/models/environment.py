from pydantic import BaseModel
from typing import Optional

class EnvironmentData(BaseModel):
    """Model for captured environment data"""
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    viewport_width: Optional[int] = None
    viewport_height: Optional[int] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    device_type: Optional[str] = None  # desktop, mobile, tablet
    url: Optional[str] = None
    pathname: Optional[str] = None
    app_version: Optional[str] = None
    language: Optional[str] = None
    hardware_concurrency: Optional[int] = None  # CPU cores
    device_memory: Optional[int] = None  # RAM in GB