export interface HealthResponse {
  status: string;
  models_loaded?: boolean;
}

export interface AttackConfig {
  attack_type: "fgsm" | "pgd";
  epsilon: number;
  pgd_steps?: number;
}

export interface CompareRequest {
  image_b64: string;
  attack_type: "fgsm" | "pgd";
  epsilon: number;
  pgd_steps?: number;
}

export interface CompareModelResult {
  survived: boolean;
  clean_pred: string;
  clean_conf: number;
  adv_pred: string;
  adv_conf: number;
}

export interface CompareResponse {
  standard_model: CompareModelResult;
  robust_model: CompareModelResult;
  attack_type: string;
  epsilon: number;
  adversarial_image_b64: string;
  perturbation_b64: string;
  original_image_b64?: string; // Manually added on frontend
}

export interface ExplainResponse {
  gradcam_standard_clean_b64: string;
  gradcam_standard_adv_b64: string;
  gradcam_robust_adv_b64: string;
  caption_standard_clean: string;
  caption_standard_adv: string;
  caption_robust_adv: string;
}

export interface SampleImage {
  index: number;
  label: string;
  image_b64: string;
}

export interface SamplesResponse {
  samples: SampleImage[];
}

// { "Clean accuracy": { "Standard": 92.94, "Robust": 87.36 }, ... }
export type ModelResults = Record<string, { Standard: number; Robust: number }>;

export interface PerClassResult {
  Class: string;
  Standard: string;
  Robust: string;
  delta: string; // normalized from "Δ (Robust − Standard)" by backend
}

const API_BASE = "/api";

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  async fetchSamples(): Promise<SampleImage[]> {
    const res = await fetch(`${API_BASE}/samples`);
    if (!res.ok) throw new Error("Failed to fetch samples");
    const data: SamplesResponse = await res.json();
    return data.samples;
  },

  async compareModels(req: CompareRequest): Promise<CompareResponse> {
    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Comparison failed");
    const data = await res.json();
    data.original_image_b64 = req.image_b64;
    return data;
  },

  async explainModels(req: CompareRequest): Promise<ExplainResponse> {
    const res = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Explain generation failed");
    return res.json();
  },

  async getModelResults(): Promise<ModelResults> {
    const res = await fetch(`${API_BASE}/results`);
    if (!res.ok) throw new Error("Failed to fetch model results");
    return res.json();
  },

  async getPerClassResults(): Promise<PerClassResult[]> {
    const res = await fetch(`${API_BASE}/per_class_results`);
    if (!res.ok) throw new Error("Failed to fetch per-class results");
    return res.json();
  },
};


/**
 * Resizes an image file to exactly 32x32 via Canvas
 * Returns the image as a Base64 string without the data URL prefix if requested,
 * but API endpoints expect 'data:image/png;base64,...' so we return the full data URL.
 */
export async function resizeImageTo32(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      
      ctx.drawImage(img, 0, 0, 32, 32);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => reject(e);
  });
}
