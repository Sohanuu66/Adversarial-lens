from pydantic import BaseModel, Field
from typing import Literal, Optional

class AttackRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded PNG image")
    attack_type: Literal["fgsm", "pgd"] = Field("fgsm", description="Type of adversarial attack")
    epsilon: float = Field(0.031, description="Attack strength (e.g. 8/255 = ~0.031)")
    model_type: Literal["standard", "robust"] = Field("standard", description="Model to attack")
    pgd_steps: Optional[int] = Field(10, description="Steps for PGD attack (ignored for FGSM)")

class CompareRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded PNG image")
    attack_type: Literal["fgsm", "pgd"] = Field("pgd", description="Type of adversarial attack")
    epsilon: float = Field(0.031, description="Attack strength (e.g. 8/255 = ~0.031)")
    pgd_steps: Optional[int] = Field(10, description="Steps for PGD attack")

class ExplainRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded PNG image")
    attack_type: Literal["fgsm", "pgd"] = Field("pgd", description="Type of adversarial attack")
    epsilon: float = Field(0.031, description="Attack strength (e.g. 8/255 = ~0.031)")
    pgd_steps: Optional[int] = Field(10, description="Steps for PGD attack")
