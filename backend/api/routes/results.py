import os
import json
import csv
from fastapi import APIRouter, HTTPException
from backend.config import COMPARISON_RESULTS_PATH, PER_CLASS_RESULTS_PATH, SAMPLE_IMAGES_DIR
from backend.schemas.responses import SamplesResponse, SampleImage
import base64

router = APIRouter()

@router.get("/results")
def get_comparison_results():
    if not COMPARISON_RESULTS_PATH.exists():
        raise HTTPException(status_code=404, detail="Comparison results not found. Run Notebook 4 first.")
    
    with open(COMPARISON_RESULTS_PATH, 'r') as f:
        return json.load(f)

@router.get("/per_class_results")
def get_per_class_results():
    if not PER_CLASS_RESULTS_PATH.exists():
        raise HTTPException(status_code=404, detail="Per-class results CSV not found. Run Notebook 4 first.")
    
    with open(PER_CLASS_RESULTS_PATH, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

@router.get("/samples", response_model=SamplesResponse)
def get_samples():
    if not SAMPLE_IMAGES_DIR.exists():
        raise HTTPException(status_code=404, detail="Sample images not found. Run: python -m backend.scripts.export_samples")
    
    samples = []
    for filename in sorted(os.listdir(SAMPLE_IMAGES_DIR)):
        if not filename.endswith(".png"):
            continue
            
        file_path = SAMPLE_IMAGES_DIR / filename
        with open(file_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode('utf-8')
        
        # Parse label from "sample_{idx}_{name}.png"
        parts = filename.replace(".png", "").split("_")
        idx = int(parts[1]) if len(parts) >= 3 else 0
        label = parts[2] if len(parts) >= 3 else "unknown"
            
        samples.append(SampleImage(index=idx, label=label, image_b64=f"data:image/png;base64,{encoded}"))
        
    return SamplesResponse(samples=samples)
