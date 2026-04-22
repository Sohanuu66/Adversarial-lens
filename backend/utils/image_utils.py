import base64
from io import BytesIO
import torch
from PIL import Image
from torchvision import transforms
from config import CIFAR10_MEAN, CIFAR10_STD

def decode_image(image_b64: str) -> Image.Image:
    """
    Decodes a base64 encoded image string to a PIL Image.
    Raises ValueError if decoding fails.
    """
    if "," in image_b64:
        # Handle data:image/png;base64,... prefixes
        image_b64 = image_b64.split(",")[1]
    
    try:
        image_data = base64.b64decode(image_b64)
        return Image.open(BytesIO(image_data)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

def encode_image(img_tensor: torch.Tensor) -> str:
    """
    Converts a standard image tensor (C, H, W) [0, 1] to base64.
    If image is un-normalized, assumes it's already clamped to [0,1].
    """
    img_tensor = img_tensor.detach().cpu()
    
    # Convert tensor (C, H, W) to numpy (H, W, C)
    if img_tensor.dim() == 4:
        img_tensor = img_tensor.squeeze(0)
    
    img_nd = (img_tensor.clamp(0, 1).permute(1, 2, 0).numpy() * 255).astype('uint8')
    img_pil = Image.fromarray(img_nd)
    
    buffer = BytesIO()
    img_pil.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"

def preprocess_image(img: Image.Image) -> torch.Tensor:
    """
    Resizes any image to 32x32 and normalizes for CIFAR-10.
    Adds batch dimension. Result is (1, C, H, W).
    """
    transform = transforms.Compose([
        transforms.Resize((32, 32)),
        transforms.ToTensor(),
        transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    ])
    return transform(img).unsqueeze(0)

def unnormalize(img_tensor: torch.Tensor) -> torch.Tensor:
    """
    Removes CIFAR-10 normalization for visualization.
    Returns tensor [0, 1].
    """
    # MEAN / STD tensors
    mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1).to(img_tensor.device)
    std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1).to(img_tensor.device)
    
    unnorm_img = img_tensor * std + mean
    return torch.clamp(unnorm_img, 0, 1)
