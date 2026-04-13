import torch
import torchattacks
from backend.config import CIFAR10_MEAN, CIFAR10_STD

def generate_fgsm(model: torch.nn.Module, images_01: torch.Tensor, labels: torch.Tensor, epsilon: float) -> torch.Tensor:
    """
    Applies FGSM to [0,1] scaled images and returns adversarial [0,1] images.
    """
    atk = torchattacks.FGSM(model, eps=epsilon)
    atk.set_normalization_used(mean=CIFAR10_MEAN, std=CIFAR10_STD)
    return atk(images_01, labels)
