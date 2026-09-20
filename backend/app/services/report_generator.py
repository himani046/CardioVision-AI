from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def generate_report(output_path: Path, case_id: str, overlay_path: Path, vessel_area: float,
                    regions: list[dict], max_narrowing: float, confidence: float):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 55, "CardioVision AI — Analysis Report")
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 75, f"Case: {case_id}")
    c.drawString(40, height - 90, f"Generated: {datetime.now().isoformat(timespec='seconds')}")

    if overlay_path.exists():
        c.drawImage(str(overlay_path), 40, height - 455, width=515, height=330,
                    preserveAspectRatio=True, anchor="c")

    y = height - 485
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Summary")
    y -= 20
    c.setFont("Helvetica", 10)
    for line in [
        f"Vessel area (image pixels): {vessel_area}%",
        f"Candidate regions: {len(regions)}",
        f"Maximum heuristic narrowing: {max_narrowing}%",
        f"Overall heuristic confidence: {confidence}%",
    ]:
        c.drawString(50, y, line)
        y -= 16

    y -= 8
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Safety notice")
    y -= 16
    c.setFont("Helvetica", 9)
    c.drawString(40, y, "Experimental research prototype. Heuristic outputs are not clinically validated.")
    c.drawString(40, y - 13, "Do not use this report for diagnosis or medical decision-making.")
    c.save()
