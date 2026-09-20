from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import RESULT_DIR
from app.routes.analysis import router as analysis_router

app = FastAPI(
    title="CardioVision AI API",
    version="1.0.0",
    description="Experimental coronary angiogram image analysis API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path(RESULT_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/results", StaticFiles(directory=RESULT_DIR), name="results")
app.include_router(analysis_router)

@app.get("/")
def root():
    return {"name": "CardioVision AI", "status": "ok", "docs": "/docs"}
