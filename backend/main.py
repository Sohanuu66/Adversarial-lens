import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.api.routes import attack, compare, explain, results
from backend.models.resnet import initialize_models
from backend.config import STANDARD_MODEL_PATH, ROBUST_MODEL_PATH

# Minimal standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Adversarial Lens Models...")
    initialize_models()
    yield
    logger.info("Shutting down gracefully...")

app = FastAPI(
    title="Adversarial Lens API",
    description="Interactive backend demonstrating adversarial attacks on image classification models.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Catchers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error for {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=400,
        content={"error": "Invalid input format or missing fields"}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc.detail)}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}")
    traceback.print_exc()
    if isinstance(exc, ValueError) and "image" in str(exc).lower():
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid image input data"}
        )
    return JSONResponse(
        status_code=500,
        content={"error": "An internal server error occurred"}
    )

# Flat routes correctly scoped under /api
app.include_router(attack.router, prefix="/api", tags=["Attack Simulator"])
app.include_router(compare.router, prefix="/api", tags=["Comparison Bench"])
app.include_router(explain.router, prefix="/api", tags=["Explainability"])
app.include_router(results.router, prefix="/api", tags=["Results & Assets"])

@app.get("/api/health", tags=["System"])
def health_check():
    from backend.models.resnet import models
    loaded = models["standard"] is not None and models["robust"] is not None
    return {"status": "ok", "models_loaded": loaded}

@app.get("/api/models/download/{model_type}", tags=["System"])
def download_model(model_type: str):
    paths = {
        "standard": str(STANDARD_MODEL_PATH),
        "robust": str(ROBUST_MODEL_PATH)
    }
    if model_type not in paths:
        return JSONResponse(status_code=404, content={"error": "Unknown model type. Must be 'standard' or 'robust'."})
    return FileResponse(
        path=paths[model_type],
        media_type="application/octet-stream",
        filename=f"{model_type}_resnet18.pth"
    )
