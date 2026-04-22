import torch
from torchvision import transforms
from config import CIFAR10_MEAN, CIFAR10_STD

def generate_pgd(model: torch.nn.Module, images_norm: torch.Tensor, labels: torch.Tensor, epsilon: float, steps: int = 10) -> torch.Tensor:
    """
    Applies PGD to normalized images (CIFAR-10 normalized).
    Returns adversarial normalized images, same space as input.
    alpha=2/255 is standard PGD evaluation config per PRD.
    images_norm: normalized tensor (1, C, H, W)
    """
    mean = torch.tensor(CIFAR10_MEAN).view(1, 3, 1, 1).to(images_norm.device)
    std = torch.tensor(CIFAR10_STD).view(1, 3, 1, 1).to(images_norm.device)
    normalize = transforms.Normalize(CIFAR10_MEAN, CIFAR10_STD)

    alpha = 2 / 255.0

    # Denormalize to [0,1] for perturbation bounding
    orig_01 = (images_norm.detach() * std + mean).clone()
    adv_01 = orig_01.clone()

    for _ in range(steps):
        adv_01.requires_grad = True

        # Normalize for model forward pass
        adv_norm = normalize(adv_01[0]).unsqueeze(0)
        outputs = model(adv_norm)
        loss = torch.nn.CrossEntropyLoss()(outputs, labels)
        model.zero_grad()
        loss.backward()

        with torch.no_grad():
            adv_01 = adv_01 + alpha * adv_01.grad.sign()
            # Project back into epsilon-ball and [0,1]
            delta = torch.clamp(adv_01 - orig_01, -epsilon, epsilon)
            adv_01 = torch.clamp(orig_01 + delta, 0, 1).detach()

    adv_norm = normalize(adv_01[0]).unsqueeze(0)
    return adv_norm
