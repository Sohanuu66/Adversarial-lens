import { motion } from "framer-motion";
import { type CompareResponse, type ModelCompareResult } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

export function CompareResults({ result, isLoading }: { result: CompareResponse | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto opacity-50 animate-pulse">
          <Card className="h-96 bg-muted/20" />
          <Card className="h-96 bg-muted/20" />
        </div>
      </section>
    );
  }

  if (!result) return null;

  const renderResultCard = (title: string, data: ModelCompareResult, advImageUri: string) => {
    const isSurvived = data.survived;
    return (
      <Card className="relative overflow-hidden border-border/50">
        <div className={`absolute top-0 left-0 w-full h-1 ${isSurvived ? 'bg-tertiary' : 'bg-destructive'}`} />
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className={`text-xs font-bold px-2 py-1 rounded-sm ${isSurvived ? 'bg-tertiary/20 text-tertiary' : 'bg-destructive/20 text-destructive'}`}>
            {isSurvived ? 'SURVIVED' : 'BREACHED'}
          </span>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-center justify-center">
             <div className="w-32 h-32 rounded bg-muted overflow-hidden flex items-center justify-center border">
                <img className="w-full h-full object-cover pixelated" src={advImageUri} alt="Adversarial input" style={{imageRendering: 'pixelated'}} />
             </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Clean Image</p>
              <p className="font-medium text-lg">{data.clean_pred}</p>
              <div className="w-full bg-muted/50 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${data.clean_conf * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">{(data.clean_conf * 100).toFixed(1)}%</p>
            </div>
            
            <div>
              <p className="text-muted-foreground mb-1">Adversarial Image</p>
              <p className={`font-medium text-lg ${isSurvived ? 'text-foreground' : 'text-destructive'}`}>
                {data.adv_pred}
              </p>
              <div className="w-full bg-muted/50 h-2 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${isSurvived ? 'bg-tertiary' : 'bg-destructive'}`} style={{ width: `${data.adv_conf * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">{(data.adv_conf * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const adbBase64Img = result.original_image_b64
     ? (result.original_image_b64.startsWith('data:') ? result.original_image_b64 : `data:image/png;base64,${result.original_image_b64}`)
     : "";

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-12"
      id="compare-results"
    >
      <div className="max-w-5xl mx-auto mb-8 text-center">
         <h3 className="text-2xl font-bold">Analysis Results</h3>
         <p className="text-muted-foreground">Original input submitted to models</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {renderResultCard("Standard CNN", result.standard_model, adbBase64Img)}
        {renderResultCard("Robust CNN (Adversarial Training)", result.robust_model, adbBase64Img)}
      </div>
    </motion.section>
  );
}
