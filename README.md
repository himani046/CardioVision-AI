# CardioVision AI 🫀

> AI-assisted coronary angiogram visualization and vessel-analysis prototype.

CardioVision AI is a full-stack computer-vision prototype for enhancing coronary angiogram images, visualizing vessel structures, flagging heuristic candidate regions, and generating a structured PDF report.

> ⚠️ **Medical disclaimer:** This is an experimental research/demo system. It is not clinically validated and must not be used for diagnosis, treatment, or medical decision-making.

## Features

- Coronary angiogram image upload
- CLAHE-based image enhancement
- Frangi vessel enhancement
- Morphology-based vessel segmentation
- Heuristic suspicious-region detection
- Visual vessel overlay
- Candidate-region metrics
- Automated PDF report
- React + FastAPI architecture
- Docker-ready backend

## Architecture

```text
React/Vite frontend
        │
        │ multipart image upload
        ▼
FastAPI backend
        │
        ▼
CLAHE → Frangi → vessel segmentation
        │
        ▼
heuristic candidate regions
        │
        ├── overlay image
        ├── JSON metrics
        └── PDF report
```

## Repository Structure

```text
CardioVision-AI/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── analysis.py
│   │   ├── services/
│   │   │   ├── preprocessing.py
│   │   │   ├── vessel_analysis.py
│   │   │   └── report_generator.py
│   │   ├── config.py
│   │   ├── main.py
│   │   └── schemas.py
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
├── .gitignore
└── README.md
```

## Run Locally

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Set `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Frontend: http://localhost:5173  
API: http://localhost:8000  
Swagger: http://localhost:8000/docs  
Health: http://localhost:8000/api/analysis/health

## Deployment

### Render
Use `backend/Dockerfile`, with root directory `backend`.

### Vercel
Use `frontend` as the project root, build with `npm run build`, output `dist`, and set:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com
```

## Analysis Pipeline

1. Decode and validate the uploaded raster image.
2. Convert to grayscale.
3. Apply CLAHE and light denoising.
4. Enhance vessel-like structures with a Frangi filter.
5. Create a vessel mask with percentile thresholding and morphology.
6. Identify connected candidate regions using heuristic image features.
7. Render an annotated overlay.
8. Save PNG, JSON, and PDF artifacts.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Axios, Lucide React |
| Backend | FastAPI, Python |
| Computer Vision | OpenCV, scikit-image, NumPy, SciPy |
| Reporting | ReportLab |
| Deployment | Docker, Render, Vercel |

## Limitations & Research Roadmap

The current narrowing/severity values are heuristic signals, **not clinical stenosis measurements**.

For a research-grade version, add expert-annotated data, patient-level splits, supervised lesion models, AUROC/AUPRC/F1/sensitivity/specificity, calibration, external validation, DICOM handling, explainability, and uncertainty estimation.

## Project Status

**Prototype / Hackathon / Research Demo**

## License

MIT
