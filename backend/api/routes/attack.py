from fastapi import APIRouter
import torch
import torch.nn.functional as F
import logging

from backend.schemas.requests import AttackRequest
from backend.schemas.responses import AttackResponse
from backend.models.resnet import get_model
from backend.attacks.fgsm import generate_fgsm
from backend.attacks.pgd import generate_pgd
from backend.utils.image_utils import decode_image, preprocess_image, encode_image, unnormalize
from backend.config import CIFAR10_CLASSES

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

    # Apply attack - attacks now take normalized tensor and return normalized tensor
    if req.attack_type == "fgsm":
        adv_norm = generate_fgsm(model, img_tensor, labels, req.epsilon)
    else:
        adv_norm = generate_pgd(model, img_tensor, labels, req.epsilon, steps=req.pgd_steps or 10)

    # Adversarial prediction - adv_norm is already normalized
    with torch.no_grad():
        out_adv = model(adv_norm)
        adv_prob = F.softmax(out_adv, dim=1)[0]
        adv_pred_idx = torch.argmax(adv_prob).item()
        adv_pred_cls = CIFAR10_CLASSES[adv_pred_idx]
        adv_conf = adv_prob[adv_pred_idx].item()

    logger.info(f"Attack={req.attack_type.upper()} Eps={req.epsilon:.3f} Model={req.model_type} | {orig_pred_cls} -> {adv_pred_cls}")

    # Unnormalize adversarial for display
    adv_01 = unnormalize(adv_norm)

    # Perturbation Viz - diff in [0,1] space, centered at 0.5 for visibility
    perturbation = torch.clamp((adv_01 - img_01) + 0.5, 0, 1)

    return AttackResponse(
        original_image_b64=encode_image(img_01),
        adversarial_image_b64=encode_image(adv_01),
        perturbation_b64=encode_image(perturbation),
        original_pred=orig_pred_cls,
        original_confidence=orig_conf,
        adversarial_pred=adv_pred_cls,
        adversarial_confidence=adv_conf
    )
