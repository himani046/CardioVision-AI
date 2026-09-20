from pydantic import BaseModel, Field

class NarrowingRegion(BaseModel):
    id: str
    x: int
    y: int
    width: int
    height: int
    severity: str
    estimated_narrowing: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=100)

class AnalysisResponse(BaseModel):
    case_id: str
    original_image_url: str
    enhanced_image_url: str
    vessel_mask_url: str
    overlay_image_url: str
    report_url: str
    vessel_area_percent: float
    suspicious_regions: int
    max_estimated_narrowing: float
    confidence: float
    regions: list[NarrowingRegion]
    disclaimer: str
