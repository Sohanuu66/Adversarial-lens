from fastapi import APIRouter
import torch
import torch.nn.functional as F
import logging
from torchvision import transforms

from backend.schemas.requests import AttackRequest
from backend.schemas.responses import AttackResponse
from backend.models.resnet import get_model
from backend.attacks.fgsm import generate_fgsm
from backend.attacks.pgd import generate_pgd
from backend.utils.image_utils import decode_image, preprocess_image, encode_image, unnormalize
from backend.config import CIFAR10_CLASSES, CIFAR10_MEAN, CIFAR10_STD

router = APIRouter()
logger = logging.getLogger("backend.attack")

@router.post("/attack", response_model=AttackResponse)
def run_attack(req: AttackRequest):
    model = get_model(req.model_type)
    device = next(model.parameters()).device
    
    img = decode_image(req.image_b64)
    # returns (1, C, H, W) normalized tensor
    img_tensor = preprocess_image(img).to(device)
    img_01 = unnormalize(img_tensor)
    
    # Original prediction
    with torch.no_grad():
        out = model(img_tensor)
        orig_prob = F.softmax(out, dim=1)[0]
        orig_pred_idx = torch.argmax(orig_prob).item()
        orig_pred_cls = CIFAR10_CLASSES[orig_pred_idx]
        orig_conf = orig_prob[orig_pred_idx].item()
        
    labels = torch.tensor([orig_pred_idx]).to(device)
    
    # Apply attack
    if req.attack_type == "fgsm":
        adv_01 = generate_fgsm(model, img_01, labels, req.epsilon)
    else:
        adv_01 = generate_pgd(model, img_01, labels, req.epsilon, steps=req.pgd_steps or 10)
        
    # Adversarial prediction - requires re-normalizing for model correctly
    normalize_transform = transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    adv_norm = normalize_transform(adv_01[0]).unsqueeze(0)
    
    with torch.no_grad():
        out_adv = model(adv_norm)
        adv_prob = F.softmax(out_adv, dim=1)[0]
        adv_pred_idx = torch.argmax(adv_prob).item()
        adv_pred_cls = CIFAR10_CLASSES[adv_pred_idx]
        adv_conf = adv_prob[adv_pred_idx].item()
        
    logger.info(f"Attack={req.attack_type.upper()} Eps={req.epsilon:.3f} Model={req.model_type} | {orig_pred_cls} -> {adv_pred_cls}")
    
    # Perturbation Viz
    perturbation = (adv_01 - img_01) * 10
    perturbation = torch.clamp(perturbation + 0.5, 0, 1)
    
    return AttackResponse(
        original_image_b64=encode_image(img_01),
        adversarial_image_b64=encode_image(adv_01),
        perturbation_b64=encode_image(perturbation),
        original_pred=orig_pred_cls,
        original_confidence=orig_conf,
        adversarial_pred=adv_pred_cls,
        adversarial_confidence=adv_conf
    )
