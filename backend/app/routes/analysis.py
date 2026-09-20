import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB, RESULT_DIR
from app.services.preprocessing import encode_png, enhance_angiogram, read_grayscale
from app.services.report_generator import generate_report
from app.services.vessel_analysis import (
    calculate_vessel_area, create_overlay, detect_suspicious_regions,
    enhance_vessels, segment_vessels,
)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.get("/health")
def health():
    return {"status": "healthy", "service": "cardiovision-ai"}

@router.post("/image")
async def analyze_image(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Unsupported file type. Use PNG, JPG, or JPEG.")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {MAX_FILE_SIZE_MB} MB limit.")

    try:
        original = read_grayscale(data)
        enhanced = enhance_angiogram(original)
        response = enhance_vessels(enhanced)
        mask = segment_vessels(response)
        regions = detect_suspicious_regions(mask, response)
        overlay = create_overlay(enhanced, mask, regions)

        case_id = f"CV-{datetime.now():%Y%m%d-%H%M%S}-{uuid4().hex[:6].upper()}"
        case_dir = RESULT_DIR / case_id
        case_dir.mkdir(parents=True, exist_ok=True)

        original_path = case_dir / "original.png"
        enhanced_path = case_dir / "enhanced.png"
        mask_path = case_dir / "vessel_mask.png"
        overlay_path = case_dir / "overlay.png"
        json_path = case_dir / "analysis.json"
        report_path = case_dir / "report.pdf"

        original_path.write_bytes(encode_png(original))
        enhanced_path.write_bytes(encode_png(enhanced))
        mask_path.write_bytes(encode_png(mask * 255))
        overlay_path.write_bytes(encode_png(overlay))

        vessel_area = calculate_vessel_area(mask)
        max_narrowing = max((r["estimated_narrowing"] for r in regions), default=0.0)
        confidence = max((r["confidence"] for r in regions), default=0.0)

        payload = {
            "case_id": case_id,
            "vessel_area_percent": vessel_area,
            "suspicious_regions": len(regions),
            "max_estimated_narrowing": max_narrowing,
            "confidence": confidence,
            "regions": regions,
            "created_at": datetime.now().isoformat(timespec="seconds"),
        }
        json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        generate_report(report_path, case_id, overlay_path, vessel_area, regions,
                        max_narrowing, confidence)

        base = f"/results/{case_id}"
        return {
            **payload,
            "original_image_url": f"{base}/original.png",
            "enhanced_image_url": f"{base}/enhanced.png",
            "vessel_mask_url": f"{base}/vessel_mask.png",
            "overlay_image_url": f"{base}/overlay.png",
            "report_url": f"{base}/report.pdf",
            "disclaimer": "Experimental research prototype. Heuristic output only; not clinically validated and not for medical decision-making.",
        }
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, "Image analysis failed.") from exc
