import torch
import base64
from io import BytesIO
from PIL import Image

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from config import CIFAR10_MEAN, CIFAR10_STD

def generate_caption(is_correct: bool, is_adversarial: bool, model_type: str) -> str:
    """
    Returns a human-readable explanation of the model's Grad-CAM behavior.
    """
    if not is_adversarial:
        return "Model focuses on relevant regions for correct classification."
    if model_type == "standard" and not is_correct:
        return "Adversarial perturbation shifts attention, causing misclassification."
    if model_type == "robust" and is_correct:
        return "Robust model maintains stable attention despite perturbation."
    return "Model behavior shows sensitivity to perturbations."

def generate_gradcam_heatmap(model: torch.nn.Module, image_01: torch.Tensor) -> str:
    """
    Generates a Grad-CAM heatmap over the image and returns a base64 string.
    Expects input image in [0, 1] range with shape (1, C, H, W).
    """
    target_layer = [model.layer4[-1]]
    
    # Normalize for the model and ensure it's a leaf tensor for GradCAM
    mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1).to(image_01.device)
    std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1).to(image_01.device)
    normalized_image = ((image_01 - mean) / std).detach().requires_grad_(True)
    
    with GradCAM(model=model, target_layers=target_layer) as cam:
        grayscale_cam = cam(input_tensor=normalized_image)
        grayscale_cam = grayscale_cam[0, :]
        
        # Overlay on the unnormalized [0, 1] image
        import numpy as np
        img_np = image_01.squeeze(0).detach().cpu().numpy().transpose(1, 2, 0)
        img_np = np.clip(img_np, 0, 1).astype(np.float32)
        visualization = show_cam_on_image(img_np, grayscale_cam, use_rgb=True)
        
        vis_pil = Image.fromarray(visualization)
        buffer = BytesIO()
        vis_pil.save(buffer, format="PNG")
        return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"
