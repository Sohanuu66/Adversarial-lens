import { motion } from "framer-motion";
import { type ExplainResponse } from "@/services/api";
import { Card, CardContent } from "./ui/card";

export function ExplainResults({ result, isLoading }: { result: ExplainResponse | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto opacity-50 animate-pulse">
           {[1, 2, 3].map(i => <Card key={i} className="h-64 bg-muted/20" />)}
        </div>
      </section>
    );
  }

  if (!result) return null;

  const ensureDataUrl = (base64: string) => base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12"
      id="explain-results"
    >
      <div className="max-w-5xl mx-auto mb-8 text-center">
         <h3 className="text-2xl font-bold">Grad-CAM Explanations</h3>
         <p className="text-muted-foreground">Visualizing network attention regions.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="border-border/50">
           <CardContent className="p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded overflow-hidden bg-muted mb-4 border">
                  <img src={ensureDataUrl(result.gradcam_standard_clean_b64)} className="w-full h-full object-cover" alt="Clean image heatmap" />
              </div>
              <h4 className="font-medium text-center">Standard Model</h4>
              <p className="text-xs text-muted-foreground text-center">Clean Image Focus</p>
           </CardContent>
        </Card>

        <Card className="border-border/50">
           <CardContent className="p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded overflow-hidden bg-muted mb-4 border border-destructive/50">
                  <img src={ensureDataUrl(result.gradcam_standard_adv_b64)} className="w-full h-full object-cover" alt="Adv image heatmap standard" />
              </div>
              <h4 className="font-medium text-center">Standard Model</h4>
              <p className="text-xs text-muted-foreground text-center">Adversarial Image Focus</p>
           </CardContent>
        </Card>

        <Card className="border-border/50">
           <CardContent className="p-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded overflow-hidden bg-muted mb-4 border border-tertiary/50">
                  <img src={ensureDataUrl(result.gradcam_robust_adv_b64)} className="w-full h-full object-cover" alt="Adv image heatmap robust" />
              </div>
              <h4 className="font-medium text-center">Robust Model</h4>
              <p className="text-xs text-muted-foreground text-center">Adversarial Image Focus</p>
           </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
