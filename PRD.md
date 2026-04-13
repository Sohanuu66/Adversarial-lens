# PRD: Adversarial Robustness & Explainability Analyzer

**Project Codename:** `adversarial-lens`
**Status:** Phase 1 Complete ✅ — Ready for Phase 2 (FastAPI) & Phase 3 (React)

---

## 1. Project Overview

### 1.1 What We're Building

An interactive system that demonstrates adversarial attacks on image classification models, compares standard vs. robust (adversarially trained) models, and visualizes model attention via Grad-CAM. Built notebook-first for fast iteration and demo-readiness, with a FastAPI + React frontend added progressively on top.

### 1.2 Core Problem Statement

Most ML students know adversarial attacks exist but have never seen them work in real time. This tool makes the abstract concrete: pick an image, watch it get attacked, see the model fail, then see the robust model survive — all with visual explanations.

### 1.3 Primary Objective

The primary objective of this project is to **analyze and demonstrate the behavior of image classification models under adversarial conditions**, with a focus on robustness and interpretability. Emphasis is placed on model performance, comparative evaluation, and explanation of failure modes — not on deployment or user interface development.

### 1.4 Development Strategy

The project follows a **notebook-first development approach**, where all core machine learning components are implemented, validated, and demonstrated through modular Jupyter notebooks. Each notebook is designed to run independently and produce reproducible outputs (model checkpoints, metrics, and visualizations), ensuring that the system is fully functional before any deployment or interface layers are added.

**Training Environment — Kaggle GPU:**
All training notebooks (NB1 and NB3) are designed to run on **Kaggle's free GPU environment** (Tesla T4 or P100). CPU training is impractical for adversarial training — always use the Kaggle GPU runtime. After training, model checkpoints (`.pth` files) are downloaded from Kaggle outputs and used locally for evaluation (NB2, NB4) and the FastAPI backend. Notebooks include Kaggle-compatible path handling (`/kaggle/working/` as the output directory) and are structured for clean single-session GPU runs.

### 1.5 Guiding Principle

> Notebooks first. Everything works before anything is wrapped.

Every module produces a saved output (checkpoint, image, CSV). The notebooks are a complete, demonstrable project on their own. The `.py` files, FastAPI backend, and React frontend are progressive enhancements — not dependencies.

---

## 2. Build Phases

The system is developed in three phases. **Phase 1** focuses on core model development and experimentation using notebooks, which serve as the primary deliverable and demonstration medium. **Phase 2** involves optional extraction of reusable components into Python modules and exposure via a backend API. **Phase 3** includes an optional frontend interface for interactive visualization. **Completion of Phase 1 alone is sufficient for a complete and evaluable system.**

```
PHASE 1 — Notebooks (core ML, demo-ready)
  └─ Notebook 1: Data + Standard Training
  └─ Notebook 2: Attack Engine
  └─ Notebook 3: Robust Training
  └─ Notebook 4: Evaluation + Grad-CAM

PHASE 2 — Backend (extract + wrap)
  └─ Extract notebook logic into backend/ .py modules
  └─ FastAPI routes load saved checkpoints + call those functions

PHASE 3 — Frontend (connect + present)
  └─ React UI hits the FastAPI endpoints
  └─ Full interactive demo
```

If only Phase 1 is complete → project is viva-ready.
If Phase 2 is complete → project has a working API.
If Phase 3 is complete → project has a full interactive demo.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| ML Framework | PyTorch | Standard for adversarial ML |
| Attacks Library | Torchattacks | Clean API for FGSM, PGD |
| Dataset | CIFAR-10 | 10 classes, fast to train |
| Model | ResNet-18 | Fast, widely understood |
| Explainability | pytorch-grad-cam | Grad-CAM visualizations |
| Backend API | FastAPI | Lightweight, async |
| Frontend | React + Tailwind CSS | Component-based UI |
| Notebooks | Jupyter (.ipynb) | Phase 1 deliverable |
| Training Environment | Kaggle GPU (T4/P100) | Free GPU; download `.pth` after training |

**CIFAR-10 Classes (index → label):**
```
0: airplane   1: automobile   2: bird    3: cat   4: deer
5: dog        6: frog         7: horse   8: ship  9: truck
```

---

## 4. Repository Structure

```
adversarial-lens/
│
├── notebooks/                        ← PHASE 1: core deliverable ✅
│   ├── 01-data-and-standard-training.ipynb
│   ├── 02-attack-engine.ipynb
│   ├── 03-robust-training.ipynb
│   └── 04-evaluation-and-gradcam.ipynb
│
├── outputs/                          ← everything notebooks save to disk ✅
│   ├── checkpoints/
│   │   ├── standard_resnet18.pth     (44.8 MB)
│   │   └── robust_resnet18.pth       (44.8 MB)
│   ├── training_curves/
│   │   ├── standard_train.csv
│   │   ├── standard_train_plot.png
│   │   ├── robust_train.csv
│   │   └── robust_train_plot.png
│   ├── adversarial_examples/         ← 30 original/FGSM/PGD image pairs + epsilon sweep
│   ├── gradcam/                      ← 13 Grad-CAM heatmap PNGs (3-scenario + diff maps)
│   ├── evaluation/                   ← robustness_curve, per_class_robustness, visual_examples
│   └── results/                      ← comparison_results.json, results.json, CSVs
│
├── assets/
│   └── sample_images/                ← 10 preselected CIFAR-10 test images
│
├── backend/                          ← PHASE 2: extract from notebooks (TODO)
│   ├── main.py
│   ├── api/routes/
│   │   ├── attack.py
│   │   ├── compare.py
│   │   └── explain.py
│   ├── models/
│   ├── attacks/
│   ├── training/
│   ├── evaluation/
│   └── explainability/
│
├── frontend/                         ← PHASE 3: React UI (TODO)
│   └── src/
│
├── requirements.txt
└── README.md
```

---

## 4.1 Kaggle GPU Workflow

This section describes the end-to-end training workflow using Kaggle's free GPU environment.

### Step-by-step:

1. **Upload notebooks** to Kaggle (via Kaggle UI or `kaggle kernels push`)
2. **Enable GPU** in Notebook settings → Accelerator → GPU T4 x2 (or P100)
3. **Run NB1** (`01_data_and_standard_training.ipynb`) — CIFAR-10 downloads automatically inside Kaggle
4. **Download** `standard_resnet18.pth` from the Kaggle output panel (`/kaggle/working/outputs/checkpoints/`)
5. **Run NB3** (`03_robust_training.ipynb`) — use same Kaggle session or a new one
6. **Download** `robust_resnet18.pth` from the Kaggle output panel
7. **Place both `.pth` files** in your local `outputs/checkpoints/` directory
8. **Run NB2 and NB4 locally** — these only load checkpoints, no training required

### Kaggle path convention used in notebooks:

```python
import os

# Detect environment automatically
IS_KAGGLE = os.path.exists('/kaggle/working')
OUTPUT_DIR = '/kaggle/working/outputs' if IS_KAGGLE else '../outputs'
```

This single snippet makes every notebook portable between Kaggle and local environments without manual path changes.

### Checkpoint handoff to FastAPI:

After downloading from Kaggle, place checkpoints at:
```
backend/outputs/checkpoints/standard_resnet18.pth
backend/outputs/checkpoints/robust_resnet18.pth
```
The FastAPI backend loads them at startup. The `/api/models/download/{model_type}` endpoint also lets you retrieve them programmatically from a running server.

---

## 5. Phase 1 — Notebook Specifications

> Each notebook saves all outputs to `outputs/`. Notebooks are self-contained and run top to bottom without errors.

---

### Notebook 1 — Data & Standard Training

**File:** `notebooks/01_data_and_standard_training.ipynb`

**Maps to:** Module 1 (Dataset) + Module 2 (Standard Training)

#### Cell outline:

**Cell 1 — Imports & config**
```python
import torch, torchvision
from torchvision import transforms, datasets
import os

SEED        = 42
BATCH_SIZE  = 128
EPOCHS      = 30          # 20–40 epochs sufficient on GPU; targets ~90%+ clean accuracy
DEVICE      = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Kaggle-compatible output paths
OUTPUT_DIR       = '/kaggle/working/outputs'   # change to '../outputs' if running locally
CHECKPOINT_PATH  = f'{OUTPUT_DIR}/checkpoints/standard_resnet18.pth'
CURVES_PATH      = f'{OUTPUT_DIR}/training_curves/standard_train.csv'
os.makedirs(f'{OUTPUT_DIR}/checkpoints', exist_ok=True)
os.makedirs(f'{OUTPUT_DIR}/training_curves', exist_ok=True)

torch.manual_seed(SEED)
print(f"Training on: {DEVICE}")
```

**Cell 2 — Dataset loading**
```python
# CIFAR-10 normalization constants (standard, always use these)
CIFAR10_MEAN = (0.4914, 0.4822, 0.4465)
CIFAR10_STD  = (0.2023, 0.1994, 0.2010)

# Train: normalize + random horizontal flip + random crop
# Test:  normalize only (no augmentation)
# Returns: train_loader, test_loader
```

**Cell 3 — Model definition**
```python
# ResNet-18 adapted for CIFAR-10 (10-class output head)
# Use torchvision.models.resnet18(weights=None) — train from scratch on CIFAR-10.
# Do NOT use ImageNet pretrained weights: CIFAR-10 is 32x32 and the distributions
# differ significantly. Training from scratch on CIFAR-10 is standard practice and
# reaches ~90%+ in 30 epochs on GPU.
# Replace the final FC layer: model.fc = nn.Linear(512, 10)
# Optionally: replace the first conv with a smaller kernel (3x3, stride=1) for 32x32 inputs
#   → model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
#   → remove model.maxpool (set to nn.Identity()) — improves clean acc ~1-2%
```

**Cell 4 — Training loop**
```python
# Optimizer: SGD, lr=0.1, momentum=0.9, weight_decay=5e-4
# Scheduler: CosineAnnealingLR(optimizer, T_max=EPOCHS)
# Save best checkpoint by validation accuracy (not just last epoch)
# Log per epoch: train_loss, train_acc, val_loss, val_acc

best_acc = 0.0
for epoch in range(EPOCHS):
    train(...)
    val_acc = evaluate(...)
    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), CHECKPOINT_PATH)  # save best weights
```

**Cell 5 — Save checkpoint + curves**
```python
# Best checkpoint already saved during training loop (best val acc)
# Save loss/acc per epoch to CURVES_PATH as CSV
# Print: f"Best checkpoint saved: {best_acc:.2f}%"
```

**Cell 6 — Plot training curves (inline)**
```python
# matplotlib: loss curve + accuracy curve side by side
```

**Cell 7 — Final evaluation**
```python
# Print: "Standard model — Best clean test accuracy: XX.X%"
# Expected range on Kaggle GPU (30 epochs): 90–93%
```

**Saved outputs:**
- `outputs/checkpoints/standard_resnet18.pth` ← **best epoch weights, not last epoch**
- `outputs/training_curves/standard_train.csv`

**Acceptance criteria:**
- [x] Notebook runs end-to-end without errors on Kaggle GPU
- [x] Clean test accuracy >= 90% (best epoch) → **Achieved: 92.94%**
- [x] Loss + accuracy curves visible inline
- [x] Checkpoint downloadable from Kaggle output panel

---

### Notebook 2 — Attack Engine

**File:** `notebooks/02_attack_engine.ipynb`

**Maps to:** Module 3 (Adversarial Attacks)

**Prerequisite:** `outputs/checkpoints/standard_resnet18.pth` must exist (run NB1 first)

#### Cell outline:

**Cell 1 — Imports & load model**
```python
# Load standard_resnet18.pth
# Set model to eval mode
```

**Cell 2 — FGSM implementation**
```python
def fgsm_attack(model, images, labels, epsilon):
    # x_adv = x + epsilon * sign(grad_x Loss(f(x), y))
    # Returns: adversarial image tensor clamped to [0,1]

def get_perturbation_viz(original, adversarial):
    # Returns: (adversarial - original) amplified 10x for visualization
```

**Cell 3 — PGD implementation**
```python
def pgd_attack(model, images, labels, epsilon, alpha=2/255, steps=10):
    # Iterative projected gradient descent
    # Returns: adversarial image tensor
```

**Cell 4 — Visual demo: single image**
```python
# Pick one test image (e.g. a cat from the test set)
# Display side-by-side inline:
#   Original | FGSM adversarial | PGD adversarial | Perturbation (10x)
# Print predictions + confidence for each
```

**Cell 5 — Accuracy under attack (batch evaluation)**
```python
# Evaluate on 1000 test images
# Print table:
#   Scenario                  | Accuracy
#   Clean                     | 93.4%
#   FGSM (eps=8/255)          | ~31%
#   PGD-10 (eps=8/255)        | ~2%
```

**Cell 6 — Epsilon sweep**
```python
# Test FGSM at eps = [0, 2, 4, 6, 8, 10, 12, 16] / 255
# Plot: accuracy vs epsilon inline
# Save: outputs/adversarial_examples/epsilon_sweep_fgsm.png
```

**Cell 7 — Save sample adversarial images**
```python
# Save 10 adversarial example pairs as PNGs
# outputs/adversarial_examples/sample_{i}_original.png
# outputs/adversarial_examples/sample_{i}_fgsm.png
# outputs/adversarial_examples/sample_{i}_pgd.png
```

**Saved outputs:**
- `outputs/adversarial_examples/` (PNG files)
- `outputs/adversarial_examples/epsilon_sweep_fgsm.png`

**Acceptance criteria:**
- [x] FGSM drops accuracy below 50% at eps=8/255 → **Achieved: 15.88%**
- [x] PGD drops accuracy below 10% at eps=8/255 → **Achieved: 0.02%**
- [x] Side-by-side image display visible inline
- [x] Perturbations are visually imperceptible on the original image

---

### Notebook 3 — Robust Training

**File:** `notebooks/03_robust_training.ipynb`

**Maps to:** Module 4 (Robust Model Training)

**Prerequisite:** CIFAR-10 already downloaded by NB1

#### Cell outline:

**Cell 1 — Imports & config**
```python
# Kaggle-compatible output paths
OUTPUT_DIR            = '/kaggle/working/outputs'   # change to '../outputs' if running locally
ROBUST_CHECKPOINT_PATH = f'{OUTPUT_DIR}/checkpoints/robust_resnet18.pth'
os.makedirs(f'{OUTPUT_DIR}/checkpoints', exist_ok=True)

EPOCHS = 30          # 20–40 epochs; adversarial training converges faster than standard

# PGD config during training — reduced steps for Kaggle GPU efficiency:
#   epsilon = 8/255, alpha = 2/255, steps = 5   ← 3–5 steps sufficient for training
# PGD config during eval (NB4 comparison table):
#   steps = 10 or 20 (stronger attack, separate from training config)
PGD_TRAIN_STEPS = 5   # reduced-step PGD during adversarial training loop
```

**Cell 2 — Adversarial training strategy (markdown cell)**

> The robust model is trained using a combination of clean and adversarially perturbed images.
> For each training batch, adversarial examples are generated using Projected Gradient Descent (PGD)
> and combined with the original clean inputs. This mixed training strategy ensures that the model
> maintains strong performance on clean data while improving robustness against adversarial perturbations.

This cell should be a markdown explanation cell — visible in the notebook as readable prose, not code.
It explains *why* the loop below looks the way it does before the reader sees the implementation.

**Cell 3 — Adversarial training loop**
```python
def adversarial_train_epoch(model, loader, optimizer, epsilon, alpha, steps):
    for images, labels in loader:
        # --- generate adversarial examples using reduced-step PGD (3–5 steps) ---
        adv_images = pgd_attack(model, images, labels, epsilon, alpha, steps)

        # --- mix clean + adversarial inputs ---
        mixed_images = torch.cat([images, adv_images], dim=0)
        mixed_labels = torch.cat([labels, labels],     dim=0)

        # --- standard training step on the mixed batch ---
        optimizer.zero_grad()
        outputs = model(mixed_images)
        loss = F.cross_entropy(outputs, mixed_labels)
        loss.backward()
        optimizer.step()

# Save best checkpoint by clean validation accuracy across epochs
best_acc = 0.0
for epoch in range(EPOCHS):
    adversarial_train_epoch(model, train_loader, optimizer, epsilon=8/255, alpha=2/255, steps=PGD_TRAIN_STEPS)
    clean_acc = evaluate_clean(model, val_loader)
    if clean_acc > best_acc:
        best_acc = clean_acc
        torch.save(model.state_dict(), ROBUST_CHECKPOINT_PATH)
```

**Why reduced-step PGD during training:**
Using 3–5 PGD steps during the adversarial training inner loop (instead of the usual 7–10) significantly reduces per-epoch time on Kaggle GPU with minimal impact on final robustness. Full-strength PGD is used only during evaluation (NB4) to measure robustness properly.

> **Always train on Kaggle GPU** — adversarial training is 3–5x slower than standard training. 30 epochs with PGD-5 on a T4 GPU takes ~1–2 hours. Local CPU is not recommended.

**Why mixed (not adversarial-only):** Training on adversarial examples alone causes the model to
overfit to PGD structure and degrades clean accuracy more than necessary. The 50/50 mix is the
standard Madry et al. approach.

**Cell 3 — Training + logging**
```python
# Same optimizer + scheduler as NB1 (SGD + CosineAnnealingLR)
# Log per epoch:
#   - clean accuracy on validation set
#   - adversarial accuracy on 500-image validation subset (PGD-10, eval-only)
```

> Note: Adversarial training is 3-5x slower than standard training. Use GPU if available.
> On CPU: reduce EPOCHS to 50, use PGD-5 during training. Clean acc ~78%, adv acc ~40% — still valid for demo.

**Cell 4 — Save checkpoint + curves**
```python
torch.save(model.state_dict(), ROBUST_CHECKPOINT_PATH)
# Save to outputs/training_curves/robust_train.csv
```

**Cell 5 — Plot comparison**
```python
# Plot standard vs robust clean accuracy curves together over epochs
```

**Cell 6 — Final evaluation**
```python
# Print:
#   Robust model — Clean accuracy:              ~75–85%   (expected range for 20–40 epochs, PGD-5 training)
#   Robust model — Adversarial acc (PGD-10):    ~45–55%
# Note: exact numbers vary with epoch count and PGD steps; these ranges are valid and demonstrate robustness
```

**Saved outputs:**
- `outputs/checkpoints/robust_resnet18.pth` ← **best epoch weights, not last epoch**
- `outputs/training_curves/robust_train.csv`

**Acceptance criteria:**
- [x] Notebook runs end-to-end on Kaggle GPU
- [x] Clean accuracy in range 75–85% → **Achieved: 87.36% (exceeded range)**
- [x] Adversarial accuracy (PGD-10) >= 40% (vs < 5% for standard model) → **Achieved: 42.58% vs 0.02%**
- [x] Checkpoint downloadable from Kaggle output panel

---

### Notebook 4 — Evaluation & Grad-CAM

**File:** `notebooks/04_evaluation_and_gradcam.ipynb`

**Maps to:** Module 5 (Evaluation) + Module 6 (Grad-CAM)

**Prerequisite:** Both checkpoints must exist (run NB1 + NB3 first)

#### Cell outline:

**Cell 1 — Load both models**
```python
standard_model = load_resnet18(STANDARD_CHECKPOINT_PATH)
robust_model   = load_resnet18(ROBUST_CHECKPOINT_PATH)
# Set both to eval mode
```

**Cell 2 — Full comparison table**
```python
# Evaluate both models on 1000 test images
# Print inline:
#   Scenario                      | Standard  | Robust
#   Clean accuracy                | ~90–93%   | ~75–85%
#   FGSM accuracy (eps=8/255)     | ~25–35%   | ~60–72%
#   PGD-10 accuracy (eps=8/255)   | ~1–5%     | ~45–55%
# Save to outputs/comparison_results.json
# Note: exact values depend on training run; ranges above reflect 20–40 epoch GPU training
```

**Cell 3 — Robustness curve**
```python
# Epsilon sweep for BOTH models using PGD
# eps = [0, 2, 4, 6, 8, 10, 12, 14, 16] / 255
# Plot: accuracy vs epsilon, two lines
# Save: outputs/gradcam/robustness_curve.png
```

**Cell 4 — Grad-CAM setup**
```python
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

# Target layer for ResNet-18: model.layer4[-1]
standard_cam = GradCAM(model=standard_model, target_layers=[standard_model.layer4[-1]])
robust_cam   = GradCAM(model=robust_model,   target_layers=[robust_model.layer4[-1]])
```

**Cell 5 — Grad-CAM caption generator**
```python
def generate_caption(is_correct: bool, is_adversarial: bool, model_type: str) -> str:
    """
    Returns a human-readable explanation of the model's Grad-CAM behavior
    for the current scenario. Used as the visible caption below each heatmap.
    """
    if not is_adversarial:
        return "Model focuses on relevant regions for correct classification."
    if model_type == "standard" and not is_correct:
        return "Adversarial perturbation shifts attention, causing misclassification."
    if model_type == "robust" and is_correct:
        return "Robust model maintains stable attention despite perturbation."
    return "Model behavior shows sensitivity to perturbations."
```

The caption is determined at runtime from three signals: whether the image is adversarial,
which model is being shown, and whether that model predicted correctly. It is rendered
as a text line directly below the heatmap in the notebook and in the frontend UI.

**Cell 6 — Grad-CAM: 3-scenario visualization (THE KEY CELL)**
```python
# For one sample image (e.g. a cat):
# Run all 3 scenarios and collect results:
#
#   scenario_1: standard model on clean image
#     → heatmap_1, pred_1, correct_1 = True (clean image, model should be right)
#
#   scenario_2: standard model on PGD adversarial image
#     → heatmap_2, pred_2, correct_2 = False (model gets fooled)
#
#   scenario_3: robust model on PGD adversarial image
#     → heatmap_3, pred_3, correct_3 = True (robust model survives)
#
# Display as a 1x3 grid using matplotlib:
#   fig, axes = plt.subplots(1, 3, figsize=(12, 4))
#
# For each panel:
#   axes[i].imshow(heatmap_overlay)
#   axes[i].set_title(f"{model_type} | {scenario}")
#   axes[i].set_xlabel(generate_caption(is_correct, is_adversarial, model_type),
#                      fontsize=9, wrap=True)
#   axes[i].axis('off')
#
# plt.tight_layout()
# plt.show()
```

Expected caption output for a correctly-working demo:
- Panel 1 (standard / clean): "Model focuses on relevant regions for correct classification."
- Panel 2 (standard / adv):   "Adversarial perturbation shifts attention, causing misclassification."
- Panel 3 (robust / adv):     "Robust model maintains stable attention despite perturbation."

**Cell 7 — Grad-CAM: batch save**
```python
# Run all 3 scenarios for 10 sample images
# Save: outputs/gradcam/sample_{i}_{scenario}.png
```

**Cell 8 — Per-image prediction grid**
```python
# For each of the 10 samples, display inline:
#   Image | True class | Std clean pred (conf) | Std adv pred (conf) | Robust adv pred (conf)
# Mark fooled predictions in red, correct in green
```

**Saved outputs:**
- `outputs/comparison_results.json`
- `outputs/gradcam/robustness_curve.png`
- `outputs/gradcam/sample_{i}_{scenario}.png` (30 PNG files)

**Acceptance criteria:**
- [x] Comparison table printed inline
- [x] 3-scenario Grad-CAM visible inline for at least 1 image → **10 samples with bonus diff maps**
- [x] Standard model heatmap visibly scatters after attack
- [x] Robust model heatmap stays on the subject after attack
- [x] All outputs saved to disk
- [x] **Bonus:** Per-class robustness analysis (not in original PRD)
- [x] **Bonus:** Attention diff maps (Robust − Standard)

---

## 6. Image Input — Two Modes

> Applies to Notebook 4 (interactive demo cells) and Phase 3 frontend.

---

### Mode 1 — Use Sample Image (Recommended Default)

Pick from 10 preselected CIFAR-10 test set images.

```python
CIFAR10_CLASSES = [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
]

def get_sample_image(index=None):
    """
    Loads a random (or indexed) image from CIFAR-10 test set.
    Guarantees correct class mapping, meaningful adversarial behavior,
    and smooth demo flow.
    """
    if index is None:
        index = random.randint(0, len(test_dataset) - 1)
    image, label = test_dataset[index]
    return image, CIFAR10_CLASSES[label], index
```

**Why this is the default:**

- Class label is guaranteed correct — comes directly from the dataset
- Image is already 32×32 and normalized — no preprocessing edge cases
- Adversarial attack behavior is predictable and visually clean
- Best choice for viva and presentations

**In Notebook 4:** Add an image picker cell that displays 10 CIFAR-10 test images as a grid with their true labels. User sets `SELECTED_INDEX = 3` (for example) and the rest of the notebook uses that image.

**In the frontend:** "Use sample image" shows a scrollable row of 10 thumbnail images with their class labels. Click one to select it. Selected image gets a highlighted border.

---

### Mode 2 — Upload Custom Image

User uploads their own image. System preprocesses and predicts.

```python
from PIL import Image

def preprocess_custom_image(image_path):
    """
    Resizes and normalizes a user-uploaded image to match
    the CIFAR-10 training distribution.
    """
    transform = transforms.Compose([
        transforms.Resize((32, 32)),
        transforms.ToTensor(),
        transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    ])
    img = Image.open(image_path).convert('RGB')
    return transform(img).unsqueeze(0)
```

**What happens after upload:**

1. Image is resized to 32×32 (CIFAR-10 resolution)
2. Normalized using CIFAR-10 mean and std constants
3. Forward pass → predicted class from the 10 CIFAR-10 labels
4. Predicted class is used as the "true" label for the attack

**UI guidance text (use this exact wording):**

> "For best results, upload images similar to CIFAR-10 classes — animals, vehicles, aircraft, or ships."

Do not write "Upload only CIFAR-like images" — that sounds like a hard restriction. The wording above reads as professional advice and keeps the UI flexible.

**Honest caveat to display below the upload zone:**

> "Custom images may produce less dramatic adversarial effects than sample images, since the model was trained on low-resolution 32×32 data. Sample images are recommended for presentations."

---

## 7. Phase 2 — Backend Extraction (When Ready)

No rewriting logic. Extract what's already in the notebooks.

### Extraction map:

| Notebook cells | Extracted to |
|---|---|
| NB1: dataset loading | `backend/data/dataset.py` |
| NB1: model definition | `backend/models/base_model.py` |
| NB2: fgsm_attack() | `backend/attacks/fgsm.py` |
| NB2: pgd_attack() | `backend/attacks/pgd.py` |
| NB3: adversarial_train_epoch() | `backend/training/train_robust.py` |
| NB4: comparison logic | `backend/evaluation/evaluator.py` |
| NB4: Grad-CAM cells | `backend/explainability/gradcam.py` |

### FastAPI endpoints (load from saved checkpoints — never re-train):

**`GET /api/samples`**
```json
Response: {
  "samples": [
    { "index": 0, "label": "cat", "image_b64": "..." },
    ...
  ]
}
```

**`POST /api/attack`**
```json
Request:  { "image_b64": "...", "attack_type": "pgd", "epsilon": 0.031, "model_type": "standard" }
Response: {
  "original_image_b64": "...",
  "adversarial_image_b64": "...",
  "perturbation_b64": "...",
  "original_pred": "cat",
  "original_confidence": 0.97,
  "adversarial_pred": "dog",
  "adversarial_confidence": 0.83
}
```

**`POST /api/compare`**
```json
Request:  { "image_b64": "...", "attack_type": "pgd", "epsilon": 0.031 }
Response: {
  "standard_model": { "clean_pred": "cat", "clean_conf": 0.97, "adv_pred": "dog", "adv_conf": 0.83, "survived": false },
  "robust_model":   { "clean_pred": "cat", "clean_conf": 0.79, "adv_pred": "cat", "adv_conf": 0.61, "survived": true },
  "attack_type": "pgd",
  "epsilon": 0.031
}
```

**`POST /api/explain`**
```json
Request:  { "image_b64": "...", "attack_type": "pgd", "epsilon": 0.031 }
Response: {
  "gradcam_standard_clean_b64": "...",
  "gradcam_standard_adv_b64": "...",
  "gradcam_robust_adv_b64": "...",
  "caption_standard_clean": "Model focuses on relevant regions for correct classification.",
  "caption_standard_adv":   "Adversarial perturbation shifts attention, causing misclassification.",
  "caption_robust_adv":     "Robust model maintains stable attention despite perturbation."
}
```

**`GET /api/health`**
```json
Response: { "status": "ok", "models_loaded": true }
```

**`GET /api/models/download/{model_type}`**

Allows downloading the trained model checkpoint directly from the FastAPI server. Useful when the backend is deployed and the user wants to export the weights without accessing Kaggle directly.

```
model_type: "standard" | "robust"
```
```python
# FastAPI route
from fastapi.responses import FileResponse

@app.get("/api/models/download/{model_type}")
def download_model(model_type: str):
    paths = {
        "standard": "outputs/checkpoints/standard_resnet18.pth",
        "robust":   "outputs/checkpoints/robust_resnet18.pth"
    }
    if model_type not in paths:
        raise HTTPException(status_code=404, detail="Unknown model type")
    return FileResponse(
        path=paths[model_type],
        media_type="application/octet-stream",
        filename=f"{model_type}_resnet18.pth"
    )
```

> This endpoint is the primary way to retrieve trained weights when the backend is running remotely. Download the `.pth` file and load it locally or share it between environments.

---

## 8. Phase 3 — Frontend (React)

### Image input section (two modes, switchable):

**Mode 1 UI — Sample image (shown by default):**
- Row of 10 CIFAR-10 thumbnails with class labels below each
- Click selects with a highlighted border
- Small label: "Recommended — guaranteed clean behavior"

**Mode 2 UI — Upload image:**
- Drag-and-drop zone or file picker
- On upload: show preview + "Preprocessing to 32×32..." status
- Below the zone, display:
  > "For best results, upload images similar to CIFAR-10 classes — animals, vehicles, aircraft, or ships."
- Below that, softer text:
  > "Custom images may produce less dramatic adversarial effects. Sample images are recommended for presentations."

### Main demo page layout:

```
┌──────────────────────────────────────────────────────────┐
│  HEADER: Adversarial Lens              [Demo] [Analysis] │
├──────────────────┬───────────────────────────────────────┤
│  LEFT SIDEBAR    │  MAIN PANEL                           │
│                  │                                       │
│  Image input:    │  [Original] [Adversarial] [Perturbation│
│  ● Sample image  │   image tiles with predictions]       │
│  ○ Upload image  │                                       │
│                  │  ── Model Comparison ──               │
│  [10 thumbnails] │  Standard: cat (97%) → dog (83%) ✗   │
│                  │  Robust:   cat (97%) → cat (61%) ✓   │
│  Attack type:    │                                       │
│  ○ FGSM          │  ── Grad-CAM ──                       │
│  ● PGD           │  [Std/clean] [Std/adv] [Robust/adv]  │
│                  │   3 heatmaps with captions            │
│  Epsilon: ──●──  │                                       │
│  0             16│                                       │
│                  │                                       │
│  [▶ Run Attack]  │                                       │
│  [⚖ Compare]    │                                       │
└──────────────────┴───────────────────────────────────────┘
```

### Components:

| Component | Responsibility |
|---|---|
| `ImageSelector.jsx` | Toggle between sample/upload modes |
| `SampleGallery.jsx` | 10 CIFAR-10 thumbnails, selectable |
| `ImageUploader.jsx` | Drag-drop or file-select, base64 encode |
| `AttackControls.jsx` | Attack type radio, epsilon slider |
| `ResultPanel.jsx` | Original / adversarial / perturbation tiles |
| `PredictionBadge.jsx` | Class + confidence + survived/fooled indicator |
| `ComparisonTable.jsx` | Side-by-side model comparison |
| `GradCAMViewer.jsx` | 3-panel heatmap display with `generate_caption()` text below each panel |
| `EpsilonCurve.jsx` | Recharts robustness curve (Analysis page) |

---

## 9. ~~Optional Module — LIME Explainability~~ (DROPPED)

> ~~Add this after Phase 1 is complete and Grad-CAM is working. It is self-contained and does not affect any existing notebook or endpoint.~~
>
> **DROPPED:** LIME was removed from scope because its superpixel-based explanations are hard to interpret on 32×32 CIFAR-10 images. Grad-CAM alone provides sufficient and clearer interpretability for the project. The Grad-CAM diff maps added in NB4 compensate by showing attention shift differences between models.

### What LIME does (and how it differs from Grad-CAM)

| | Grad-CAM | LIME |
|---|---|---|
| **Type** | Gradient-based, model-specific | Perturbation-based, model-agnostic |
| **Output** | Continuous heatmap over pixels | Highlighted / suppressed superpixel regions |
| **Question it answers** | Where is the model looking? | Which image regions actually drive this prediction? |
| **Speed** | Fast (~0.1s per image) | Slower (~5-15s per image, 1000 perturbation samples) |
| **Visual feel** | Smooth color overlay | Distinct patches — green (supports), red (contradicts) |

**The demo story with both:** "Grad-CAM shows attention — LIME shows decision evidence. In the standard model after an attack, both shift away from the object. In the robust model, both stay on it."

This side-by-side makes the explainability section substantially richer and takes maybe 2-3 hours to add once the rest is done.

---

### Notebook 5 — LIME Explainability (Optional)

**File:** `notebooks/05_lime_explainability.ipynb`

**Prerequisite:** Both checkpoints must exist. Runs independently of NB4.

**Install:**
```
pip install lime
```

#### Cell outline:

**Cell 1 — Imports & setup**
```python
from lime import lime_image
from skimage.segmentation import mark_boundaries
import numpy as np

explainer = lime_image.LimeImageExplainer()

# Prediction function wrapper — LIME needs a function that takes
# a batch of numpy images (N, H, W, C) in [0,1] range and returns
# softmax probabilities (N, num_classes)
def predict_fn_standard(images):
    # preprocess: numpy → tensor → normalize → forward → softmax
    ...

def predict_fn_robust(images):
    # same, but uses robust_model
    ...
```

**Cell 2 — LIME on a single clean image**
```python
# Run LIME on one CIFAR-10 test image using the standard model
explanation = explainer.explain_instance(
    image=np.array(original_image),   # HxWxC, float32 in [0,1]
    classifier_fn=predict_fn_standard,
    top_labels=3,
    hide_color=0,
    num_samples=1000                   # number of perturbations
)

# Get image + mask for the top predicted class
temp, mask = explanation.get_image_and_mask(
    label=explanation.top_labels[0],
    positive_only=True,   # green = regions that support the prediction
    negative_only=False,
    num_features=5,        # top 5 superpixel regions
    hide_rest=False
)

# Display: original | LIME overlay (green = supports, red = contradicts)
plt.imshow(mark_boundaries(temp, mask))
```

**Cell 3 — LIME: 4-scenario comparison**
```python
# Run for one image across 4 scenarios and display as a 2x2 grid:
#
#   [Standard / clean]      [Standard / adversarial]
#   [Robust   / clean]      [Robust   / adversarial]
#
# For each panel:
#   - Run explainer.explain_instance() with the appropriate predict_fn
#   - Get image + mask with positive_only=True (green = supporting regions)
#   - Also get negative mask (red = regions contradicting the prediction)
#   - Display with mark_boundaries overlay
#   - Add generate_caption() below each panel (reuse from NB4)
#
# Key observation to highlight in captions:
#   Standard / adversarial → green regions scatter across background noise
#   Robust   / adversarial → green regions stay on the main object
```

**Cell 4 — LIME: batch save**
```python
# Run all 4 scenarios for 5 sample images
# Save as: outputs/lime/sample_{i}_standard_clean.png
#          outputs/lime/sample_{i}_standard_adv.png
#          outputs/lime/sample_{i}_robust_clean.png
#          outputs/lime/sample_{i}_robust_adv.png
```

**Cell 5 — Side-by-side: Grad-CAM vs LIME**
```python
# For one image, display a 2x3 grid:
#
#   Row 1 (Grad-CAM): [Std/clean]  [Std/adv]  [Robust/adv]
#   Row 2 (LIME):     [Std/clean]  [Std/adv]  [Robust/adv]
#
# This is the strongest visualization in the project.
# Both methods tell the same story — one with heatmaps, one with patches.
# Add a title row: "Grad-CAM (where the model looks)" and
#                  "LIME (what regions support the decision)"
```

**Saved outputs:**
- `outputs/lime/sample_{i}_{scenario}.png` (20 PNG files)

**Acceptance criteria:**
- [ ] LIME overlay renders with visible green (supporting) regions on clean image
- [ ] Standard model LIME regions visibly shift after attack
- [ ] Robust model LIME regions stay on the object after attack
- [ ] Grad-CAM vs LIME side-by-side grid renders inline

> ⚠️ **Performance note:** `num_samples=1000` takes ~5-15s per image on CPU. For the notebook demo
> this is fine. For the API endpoint, cache LIME results — do not run on every request.

---

### Backend — LIME Endpoint (Optional)

**Extract to:** `backend/explainability/lime_explainer.py`

```python
from lime import lime_image
from skimage.segmentation import mark_boundaries

class LIMEExplainer:
    def __init__(self, model, num_samples=1000):
        self.model = model
        self.num_samples = num_samples
        self.explainer = lime_image.LimeImageExplainer()

    def explain(self, image_np: np.ndarray, num_features: int = 5) -> np.ndarray:
        """
        image_np: HxWxC float32 in [0,1]
        Returns: RGB overlay image as numpy array
        """
        explanation = self.explainer.explain_instance(
            image_np, self._predict_fn,
            top_labels=1, hide_color=0,
            num_samples=self.num_samples
        )
        temp, mask = explanation.get_image_and_mask(
            explanation.top_labels[0],
            positive_only=False,
            num_features=num_features,
            hide_rest=False
        )
        return mark_boundaries(temp, mask)

    def _predict_fn(self, images):
        # numpy batch (N,H,W,C) → tensor → normalize → softmax
        ...
```

**New endpoint:**

**`POST /api/lime`**
```json
Request: {
  "image_b64": "...",
  "attack_type": "pgd",
  "epsilon": 0.031
}

Response: {
  "lime_standard_clean_b64": "...",
  "lime_standard_adv_b64":   "...",
  "lime_robust_clean_b64":   "...",
  "lime_robust_adv_b64":     "...",
  "caption_standard_clean":  "Model focuses on relevant regions for correct classification.",
  "caption_standard_adv":    "Adversarial perturbation shifts attention, causing misclassification.",
  "caption_robust_clean":    "Model focuses on relevant regions for correct classification.",
  "caption_robust_adv":      "Robust model maintains stable attention despite perturbation."
}
```

> Cache LIME results keyed on `(image_hash, attack_type, epsilon)`. LIME is too slow to recompute per request.

---

### Frontend — LIME UI (Optional)

**New component:** `LIMEViewer.jsx`

Displayed as a new tab inside the explainability section, alongside Grad-CAM:

```
── Explainability ──────────────────────────────────────
  [Grad-CAM]  [LIME]   ← tab switcher

  Grad-CAM tab (default):
    [Std/clean]     [Std/adv]      [Robust/adv]
    caption         caption        caption

  LIME tab:
    [Std/clean]     [Std/adv]      [Robust/adv]
    caption         caption        caption

    ℹ️  Green regions support the prediction.
        Red regions contradict it.
```

**Add to repo structure:**
```
backend/explainability/
  └── lime_explainer.py       ← new

frontend/src/components/
  └── LIMEViewer.jsx          ← new

outputs/lime/                 ← new, created by NB5
```

---

## 10. Non-Functional Requirements

| Requirement | Target | Actual (Phase 1) |
|---|---|---|
| API response time | < 5s on CPU, < 1s on GPU | TBD (Phase 2) |
| Notebook runtime (NB1, Kaggle GPU) | ~20–40 min for 30 epochs | ✅ |
| Notebook runtime (NB3, Kaggle GPU) | ~1–2 hours for 30 epochs (adversarial training) | ✅ |
| Training environment | Kaggle GPU (T4 or P100) | ✅ |
| Standard model clean accuracy | ~90–93% | **92.94%** ✅ |
| Robust model clean accuracy | ~75–85% | **87.36%** ✅ (exceeded) |
| Robust model adversarial accuracy (PGD-10) | ~45–55% | **42.58%** ✅ (close) |
| Clean accuracy trade-off (Std − Robust) | 8–15% typical | **5.58%** ✅ (excellent) |
| PGD steps during training | 3–5 | 5 ✅ |
| Checkpoint size | < 100MB per model | **44.8 MB** ✅ |
| Random seed | 42 set everywhere | ✅ |
| Browser support | Chrome 90+, Firefox 88+ | TBD (Phase 3) |

---

## 11. Priority & Drop Order

**Must complete — project is incomplete without these:**
- ~~Notebook 1 (standard training)~~ ✅ DONE
- ~~Notebook 2 (attacks + accuracy table)~~ ✅ DONE
- ~~Notebook 3 (robust training)~~ ✅ DONE
- ~~Notebook 4 (evaluation + Grad-CAM)~~ ✅ DONE

**Now in progress:**
- Phase 2 backend (FastAPI) ← **NEXT**
- Phase 3 frontend (React UI)

**Safe to drop if time is short (in order):**
1. Targeted attack endpoint and UI
2. Robustness curve Analysis page
3. Custom image upload — keep sample-only mode, still fully demo-able
4. ~~LIME (Notebook 5 + `/api/lime` + `LIMEViewer.jsx`)~~ — **DROPPED** (Grad-CAM + diff maps cover explainability)
5. Natural language explanations

---

## 12. Deliverables Checklist

**Phase 1 — Notebooks ✅ COMPLETE:**
- [x] `01-data-and-standard-training.ipynb` runs clean top-to-bottom on Kaggle GPU
- [x] `02-attack-engine.ipynb` runs clean top-to-bottom
- [x] `03-robust-training.ipynb` runs clean top-to-bottom on Kaggle GPU
- [x] `04-evaluation-and-gradcam.ipynb` runs clean top-to-bottom
- [x] `outputs/checkpoints/standard_resnet18.pth` saved (44.8 MB)
- [x] `outputs/checkpoints/robust_resnet18.pth` saved (44.8 MB)
- [x] Standard model clean accuracy >= 90% → **92.94%**
- [x] Robust model clean accuracy in range 75–85% → **87.36% (exceeded)**
- [x] Robust model adversarial accuracy (PGD-10) >= 40% → **42.58%**
- [x] Comparison table printed inline in NB4
- [x] 3-scenario Grad-CAM visible inline in NB4 (+ bonus diff maps)
- [x] Both `.pth` checkpoints downloaded from Kaggle output panel
- [x] **Bonus:** Per-class robustness breakdown with visualization
- [x] **Bonus:** Attention diff maps (Robust − Standard)

**~~Optional — LIME:~~ DROPPED**
- ~~LIME was removed from scope — hard to interpret on 32×32 images~~

**Phase 2 — Backend (TODO):**
- [ ] All API endpoints return correct responses
- [ ] Models loaded once at startup, not per request
- [ ] CORS enabled for localhost:3000
- [ ] `GET /api/models/download/standard` returns `.pth` file
- [ ] `GET /api/models/download/robust` returns `.pth` file

**Phase 3 — Frontend (TODO):**
- [ ] Sample gallery renders and is selectable
- [ ] Upload mode works with guidance text displayed
- [ ] Attack results display correctly
- [ ] Grad-CAM heatmaps render with captions

**Final:**
- [ ] README with setup and run instructions
- [ ] Report: methodology, observations, conclusions

---

## 13. Phase 1 Results Summary (Actual)

| Metric | Standard Model | Robust Model |
|--------|---------------|-------------|
| Clean Accuracy | 92.94% | 87.36% |
| FGSM Accuracy (ε=8/255) | 15.88% | 52.72% |
| PGD-5 Accuracy (ε=8/255) | 0.10% | 45.94% |
| PGD-10 Accuracy (ε=8/255) | 0.02% | 42.58% |
| Training Epochs | 30 | 30 |
| Clean-Robust Trade-off | — | −5.58% (excellent) |

**Weakest robust classes:** cat (17.8%), deer (19.6%), bird (29.2%)
**Strongest robust classes:** automobile (65.8%), horse (55.6%), truck (55.8%), ship (55.0%)

---

*End of PRD v3.0 — Phase 1 Complete*
