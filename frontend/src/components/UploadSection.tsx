import { useState } from "react";
import { FileUpload } from "./ui/file-upload";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { api, resizeImageTo32, type AttackConfig, type CompareRequest } from "@/services/api";

interface UploadSectionProps {
  onCompare: (req: CompareRequest) => Promise<void>;
  onExplain: (req: CompareRequest) => Promise<void>;
  isAnalyzing: boolean;
}

export function UploadSection({ onCompare, onExplain, isAnalyzing }: UploadSectionProps) {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [sampleLabel, setSampleLabel] = useState<string | null>(null);
  const [attackType, setAttackType] = useState<string>("FGSM");
  const [epsilon, setEpsilon] = useState<number>(8); // representing 8/255
  const [steps, setSteps] = useState<number>(10);
  const [isResizing, setIsResizing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsResizing(true);
    try {
      const resized = await resizeImageTo32(file);
      setBase64Image(resized.split(',')[1]); // API might need raw base64 or data URL, let's pass data url
      setBase64Image(resized);
      setSampleLabel(null); // Clear sample label for custom uploads
    } catch (err) {
      console.error(err);
      alert("Failed to resize image");
    } finally {
      setIsResizing(false);
    }
  };

  const handleRandomSample = async () => {
    try {
      setIsResizing(true);
      const samples = await api.fetchSamples();
      if (samples && samples.length > 0) {
        const randomItem = samples[Math.floor(Math.random() * samples.length)];
        setBase64Image(randomItem.image_b64.split(',')[1]); 
        setSampleLabel(randomItem.label);
      }
    } catch (err) {
      console.error("Failed to fetch random sample", err);
    } finally {
      setIsResizing(false);
    }
  };

  const buildRequest = (): CompareRequest => {
    return {
      image_b64: base64Image || "",
      attack_type: attackType.toLowerCase() as "fgsm" | "pgd",
      epsilon: epsilon / 255.0,
      pgd_steps: attackType === "PGD" ? steps : undefined,
    };
  };

  return (
    <section id="upload-section" className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Configure Attack</h2>
            <p className="text-muted-foreground">Upload an image and set adversarial parameters.</p>
          </div>
          
          <FileUpload 
            onChange={handleFileSelect} 
            onRandomSample={handleRandomSample}
          />
          {base64Image && (
             <div className="w-full mt-4 flex flex-col items-center justify-center p-4 border rounded-xl bg-card shadow-sm">
                <span className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                   Input Preview 
                   {sampleLabel && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                         True Class: {sampleLabel}
                      </span>
                   )}
                </span>
                <img 
                  src={base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`} 
                  alt="preview" 
                  style={{ imageRendering: 'pixelated' }}
                  className="w-32 h-32 object-cover border rounded-md shadow-inner" 
                />
             </div>
          )}
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Attack Type</Label>
                <Select value={attackType} onValueChange={setAttackType}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select attack" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FGSM">FGSM (Fast Gradient Sign)</SelectItem>
                    <SelectItem value="PGD">PGD (Projected Gradient Descent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Epsilon Strength ({epsilon}/255)</Label>
                  <span className="text-xs text-muted-foreground">{(epsilon/255).toFixed(3)}</span>
                </div>
                <Input 
                  type="range" 
                  min="1" max="64" step="1" 
                  value={epsilon} 
                  onChange={(e) => setEpsilon(Number(e.target.value))}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Subtle</span>
                  <span>Visible</span>
                  <span>Distorted</span>
                </div>
              </div>

              {attackType === "PGD" && (
                <div className="space-y-2">
                  <Label>PGD Steps</Label>
                  <Input 
                    type="number" 
                    min="1" max="50" 
                    value={steps} 
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="bg-background"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <Button 
                disabled={!base64Image || isResizing || isAnalyzing} 
                onClick={() => onCompare(buildRequest())}
                className="w-full text-primary-foreground font-bold"
              >
                {isAnalyzing ? "Comparing..." : "⚡ Compare Models"}
              </Button>
              <Button 
                disabled={!base64Image || isResizing || isAnalyzing} 
                onClick={() => onExplain(buildRequest())}
                variant="outline"
                className="w-full"
              >
                {isAnalyzing ? "Processing..." : "🔍 Explain (Grad-CAM)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
