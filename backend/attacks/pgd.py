import torch
import torchattacks
from backend.config import CIFAR10_MEAN, CIFAR10_STD

def generate_pgd(model: torch.nn.Module, images_01: torch.Tensor, labels: torch.Tensor, epsilon: float, steps: int = 10) -> torch.Tensor:
    """
    Applies PGD to [0,1] scaled images and returns adversarial [0,1] images.
    alpha=2/255 is standard PGD evaluation config per PRD.
    """
    atk = torchattacks.PGD(model, eps=epsilon, alpha=2/255, steps=steps, random_start=True)
    atk.set_normalization_used(mean=CIFAR10_MEAN, std=CIFAR10_STD)
    return atk(images_01, labels)
