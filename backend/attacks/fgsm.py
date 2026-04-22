import torch
from torchvision import transforms
from config import CIFAR10_MEAN, CIFAR10_STD

def generate_fgsm(model: torch.nn.Module, images_norm: torch.Tensor, labels: torch.Tensor, epsilon: float) -> torch.Tensor:
    """
    Applies FGSM to normalized images (CIFAR-10 normalized).
    Returns adversarial normalized images, same space as input.
    images_norm: normalized tensor (1, C, H, W)
    """
    images_norm = images_norm.clone().detach()
    images_norm.requires_grad = True

    outputs = model(images_norm)
    loss = torch.nn.CrossEntropyLoss()(outputs, labels)
    model.zero_grad()
    loss.backward()

    sign_grad = images_norm.grad.data.sign()

    # Attack in [0,1] space to keep epsilon meaningful visually
    mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1).to(images_norm.device)
    std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1).to(images_norm.device)

    # Denormalize, add perturbation, re-normalize
    images_01 = images_norm.detach() * std + mean
    adv_01 = torch.clamp(images_01 + epsilon * sign_grad, 0, 1)

    normalize = transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)
    adv_norm = normalize(adv_01[0]).unsqueeze(0)
    return adv_norm
