import cv2
import numpy as np
from skimage.filters import frangi
from skimage.morphology import remove_small_holes, remove_small_objects

def enhance_vessels(image: np.ndarray) -> np.ndarray:
    normalized = image.astype(np.float32) / 255.0
    response = frangi(normalized, sigmas=range(1, 4), black_ridges=False)
    response = cv2.normalize(response, None, 0, 255, cv2.NORM_MINMAX)
    return response.astype(np.uint8)

def segment_vessels(vessel_response: np.ndarray) -> np.ndarray:
    threshold = np.percentile(vessel_response, 86)
    mask = vessel_response >= threshold
    mask = remove_small_objects(mask, min_size=80)
    mask = remove_small_holes(mask, area_threshold=120)
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, kernel)
    return (mask > 0).astype(np.uint8)

def calculate_vessel_area(mask: np.ndarray) -> float:
    return round(float(mask.mean() * 100.0), 2)

def detect_suspicious_regions(mask: np.ndarray, vessel_response: np.ndarray):
    binary = (mask * 255).astype(np.uint8)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    regions = []

    for label in range(1, num_labels):
        x, y, w, h, area = stats[label]
        if area < 150 or w < 10 or h < 10:
            continue

        component = labels == label
        concentration = float(np.mean(vessel_response[component]) / 255.0)
        compactness = min(1.0, area / max(1.0, w * h))
        score = np.clip(0.65 * concentration + 0.35 * (1.0 - compactness), 0, 1)

        narrowing = round(float(score) * 70.0, 1)
        severity = "Severe" if narrowing >= 50 else "Moderate" if narrowing >= 30 else "Mild"
        confidence = round(55.0 + float(score) * 40.0, 1)

        regions.append({
            "id": f"R{len(regions) + 1:02d}",
            "x": int(x), "y": int(y), "width": int(w), "height": int(h),
            "severity": severity,
            "estimated_narrowing": narrowing,
            "confidence": confidence,
        })

    return sorted(regions, key=lambda r: r["estimated_narrowing"], reverse=True)[:8]

def create_overlay(original: np.ndarray, mask: np.ndarray, regions: list[dict]) -> np.ndarray:
    base = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)
    green = np.zeros_like(base)
    green[:, :, 1] = 220
    overlay = (0.60 * base + 0.40 * green).astype(np.uint8)
    base = np.where(mask[..., None] > 0, overlay, base)

    for region in regions:
        x, y, w, h = region["x"], region["y"], region["width"], region["height"]
        color = (80, 80, 255) if region["severity"] == "Severe" else (30, 190, 255) if region["severity"] == "Moderate" else (80, 210, 140)
        cv2.rectangle(base, (x, y), (x + w, y + h), color, 2)
        cv2.putText(base, f'{region["id"]} {region["severity"]}', (x, max(18, y - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    return base
