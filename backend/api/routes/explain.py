from fastapi import APIRouter
import torch
import logging

from schemas.requests import ExplainRequest
from schemas.responses import ExplainResponse
from models.resnet import get_model
from attacks.fgsm import generate_fgsm
from attacks.pgd import generate_pgd
from utils.image_utils import decode_image, preprocess_image, unnormalize
from config import CIFAR10_CLASSES, CIFAR10_MEAN, CIFAR10_STD
from explainability.gradcam import generate_gradcam_heatmap, generate_caption
from torchvision import transforms

router = APIRouter()
logger = logging.getLogger("backend.explain")

@router.post("/explain", response_model=ExplainResponse)
def run_explain(req: ExplainRequest):
    std_model = get_model("standard")
    rob_model = get_model("robust")
    device = next(std_model.parameters()).device
    
    img = decode_image(req.image_b64)
    img_tensor = preprocess_image(img).to(device)
    img_01 = unnormalize(img_tensor)
    
    # Base setup: Get prediction from standard model as the target for attack
    with torch.no_grad():
        out = std_model(img_tensor)
        true_label_idx = torch.argmax(out, dim=1).item()
    labels = torch.tensor([true_label_idx]).to(device)
    
    # Generate adversarial image
    if req.attack_type == "fgsm":
        adv_01 = generate_fgsm(std_model, img_01, labels, req.epsilon)
    else:
        adv_01 = generate_pgd(std_model, img_01, labels, req.epsilon, steps=req.pgd_steps or 10)
        
    # Helper for predictions
    normalize = transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    adv_norm = normalize(adv_01[0]).unsqueeze(0)
    
    with torch.no_grad():
        clean_pred_idx = torch.argmax(std_model(img_tensor), dim=1).item()
        std_adv_pred_idx = torch.argmax(std_model(adv_norm), dim=1).item()
        rob_adv_pred_idx = torch.argmax(rob_model(adv_norm), dim=1).item()
        
    correct_clean = (clean_pred_idx == true_label_idx)
    std_correct_adv = (std_adv_pred_idx == true_label_idx)
    rob_correct_adv = (rob_adv_pred_idx == true_label_idx)
    
    # Heatmaps
    heatmap_clean = generate_gradcam_heatmap(std_model, img_01)
    heatmap_std_adv = generate_gradcam_heatmap(std_model, adv_01)
    heatmap_rob_adv = generate_gradcam_heatmap(rob_model, adv_01)
    
    # Captions
    caption_clean = generate_caption(correct_clean, False, "standard")
    caption_std_adv = generate_caption(std_correct_adv, True, "standard")
    caption_rob_adv = generate_caption(rob_correct_adv, True, "robust")
    
    logger.info(f"Explain: {req.attack_type.upper()} ({req.epsilon}). Visuals Generated.")
    
    return ExplainResponse(
        gradcam_standard_clean_b64=heatmap_clean,
        gradcam_standard_adv_b64=heatmap_std_adv,
        gradcam_robust_adv_b64=heatmap_rob_adv,
        caption_standard_clean=caption_clean,
        caption_standard_adv=caption_std_adv,
        caption_robust_adv=caption_rob_adv
    )
