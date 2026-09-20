from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
RESULT_DIR = BASE_DIR / "results"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
