import logging
import torch
import torch.nn as nn
from torchvision.models import resnet18
from backend.config import STANDARD_MODEL_PATH, ROBUST_MODEL_PATH

logger = logging.getLogger("backend.models")

# Dictionary to hold the loaded models globally
models = {
    "standard": None,
    "robust": None
}

def load_resnet18(checkpoint_path: str, device: torch.device) -> nn.Module:
    """
    Creates a ResNet18 model configured for CIFAR-10 and loads weights.
    """
    model = resnet18(weights=None)
    # CIFAR-10 modifications
    model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
    model.maxpool = nn.Identity()
    model.fc = nn.Linear(512, 10)
    
    # Load weights
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
    model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()
    
    return model

def initialize_models():
    """
    Called at API startup to preload both models into memory.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    try:
        models["standard"] = load_resnet18(str(STANDARD_MODEL_PATH), device)
        logger.info("Standard model loaded successfully.")
    except Exception as e:
        logger.warning(f"Standard model checkpoint missing or corrupted: {e}")

    try:
        models["robust"] = load_resnet18(str(ROBUST_MODEL_PATH), device)
        logger.info("Robust model loaded successfully.")
    except Exception as e:
        logger.warning(f"Robust model checkpoint missing or corrupted: {e}")

def get_model(model_type: str) -> nn.Module:
    """
    Retrieve the preloaded model by type.
    """
    if model_type not in models or models[model_type] is None:
        raise ValueError(f"Model '{model_type}' is not loaded.")
    return models[model_type]
