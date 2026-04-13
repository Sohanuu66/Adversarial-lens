from pydantic import BaseModel

class ErrorResponse(BaseModel):
    error: str

class AttackResponse(BaseModel):
    original_image_b64: str
    adversarial_image_b64: str
    perturbation_b64: str
    original_pred: str
    original_confidence: float
    adversarial_pred: str
    adversarial_confidence: float

class CompareModelResult(BaseModel):
    clean_pred: str
    clean_conf: float
    adv_pred: str
    adv_conf: float
    survived: bool

class CompareResponse(BaseModel):
    standard_model: CompareModelResult
    robust_model: CompareModelResult
    attack_type: str
    epsilon: float

class ExplainResponse(BaseModel):
    gradcam_standard_clean_b64: str
    gradcam_standard_adv_b64: str
    gradcam_robust_adv_b64: str
    caption_standard_clean: str
    caption_standard_adv: str
    caption_robust_adv: str

class SampleImage(BaseModel):
    index: int
    label: str
    image_b64: str

class SamplesResponse(BaseModel):
    samples: list[SampleImage]
