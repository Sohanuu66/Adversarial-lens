from pathlib import Path

# Paths relative to the project root (assuming backend is run from root or path resolved)
# Base directory is one level up from backend/config.py
BASE_DIR = Path(__file__).resolve().parent.parent

# Outputs and Models
OUTPUTS_DIR = BASE_DIR / "outputs"
CHECKPOINTS_DIR = OUTPUTS_DIR / "checkpoints"
STANDARD_MODEL_PATH = CHECKPOINTS_DIR / "standard_resnet18.pth"
ROBUST_MODEL_PATH = CHECKPOINTS_DIR / "robust_resnet18.pth"

# Results
RESULTS_DIR = OUTPUTS_DIR / "results"
EVALUATION_DIR = OUTPUTS_DIR / "evaluation"
COMPARISON_RESULTS_PATH = RESULTS_DIR / "comparison_results.json"
PER_CLASS_RESULTS_PATH = RESULTS_DIR / "per_class_results.csv"

# Predefined Assets
ASSETS_DIR = BASE_DIR / "assets"
SAMPLE_IMAGES_DIR = ASSETS_DIR / "sample_images"

# CIFAR-10 Normalization Constants
CIFAR10_MEAN = (0.4914, 0.4822, 0.4465)
CIFAR10_STD = (0.2023, 0.1994, 0.2010)

# Classes
CIFAR10_CLASSES = [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
]
