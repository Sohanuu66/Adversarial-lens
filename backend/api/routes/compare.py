from fastapi import APIRouter
import torch
import torch.nn.functional as F
import logging
from torchvision import transforms

from backend.schemas.requests import CompareRequest
from backend.schemas.responses import CompareResponse, CompareModelResult
from backend.models.resnet import get_model
from backend.attacks.fgsm import generate_fgsm
from backend.attacks.pgd import generate_pgd
from backend.utils.image_utils import decode_image, preprocess_image, unnormalize
from backend.config import CIFAR10_CLASSES, CIFAR10_MEAN, CIFAR10_STD

router = APIRouter()
logger = logging.getLogger("backend.compare")

def evaluate_model(model, img_tensor, adv_01, true_label_idx) -> CompareModelResult:
    # Clean prediction
    with torch.no_grad():
        out_clean = model(img_tensor)
        prob_clean = F.softmax(out_clean, dim=1)[0]
        clean_pred_idx = torch.argmax(prob_clean).item()
        clean_conf = prob_clean[clean_pred_idx].item()
        
    # Adversarial prediction
    normalize = transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    adv_norm = normalize(adv_01[0]).unsqueeze(0)
    with torch.no_grad():
        out_adv = model(adv_norm)
        prob_adv = F.softmax(out_adv, dim=1)[0]
        adv_pred_idx = torch.argmax(prob_adv).item()
        adv_conf = prob_adv[adv_pred_idx].item()
        
    return CompareModelResult(
        clean_pred=CIFAR10_CLASSES[clean_pred_idx],
        clean_conf=clean_conf,
        adv_pred=CIFAR10_CLASSES[adv_pred_idx],
        adv_conf=adv_conf,
        survived=(adv_pred_idx == true_label_idx)
    )

@router.post("/compare", response_model=CompareResponse)
def run_compare(req: CompareRequest):
    std_model = get_model("standard")
    rob_model = get_model("robust")
    device = next(std_model.parameters()).device
    
    img = decode_image(req.image_b64)
    img_tensor = preprocess_image(img).to(device)
    img_01 = unnormalize(img_tensor)
    
    # Ground truth for attack generation
    with torch.no_grad():
        out = std_model(img_tensor)
        true_label_idx = torch.argmax(out, dim=1).item()
    labels = torch.tensor([true_label_idx]).to(device)
    
    # Generate attack using standard model
    if req.attack_type == "fgsm":
        adv_01 = generate_fgsm(std_model, img_01, labels, req.epsilon)
    else:
        adv_01 = generate_pgd(std_model, img_01, labels, req.epsilon, steps=req.pgd_steps or 10)
        
    # Evaluate Standard
    std_res = evaluate_model(std_model, img_tensor, adv_01, true_label_idx)
    # Evaluate Robust
    rob_res = evaluate_model(rob_model, img_tensor, adv_01, true_label_idx)
    
    logger.info(f"Compare: {req.attack_type.upper()} ({req.epsilon}). Std Survived={std_res.survived}, Rob Survived={rob_res.survived}")
    
    return CompareResponse(
        standard_model=std_res,
        robust_model=rob_res,
        attack_type=req.attack_type,
        epsilon=req.epsilon
    )
