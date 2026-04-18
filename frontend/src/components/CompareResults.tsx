"use client";

import { motion } from "framer-motion";
import { type CompareResponse, type CompareModelResult } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Plus, Equal, ShieldCheck, ShieldAlert, Target, Info } from "lucide-react";
import * as RechartsPrimitive from "recharts";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

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

  const ensureDataUrl = (b64: string) => b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;

  const renderResultCard = (title: string, data: CompareModelResult, advImageUri: string, isRobust: boolean) => {
    const isSurvived = data.survived;
    const confidencePct = Math.round(data.adv_conf * 100);
    
    // Radial chart color based on success/failure
    const barColor = isSurvived 
      ? "hsl(145, 60%, 50%)"   // Emerald
      : "hsl(5, 100%, 84%)";    // Softer Salmon/Red (Matches theme destructive)
      
    const chartData = [{ value: confidencePct, fill: barColor }];

    return (
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${isSurvived ? 'bg-emerald-500' : 'bg-destructive'}`} />
        
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {title}
              {isRobust && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                  SECURE
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Prediction for adversarial input</p>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
            isSurvived 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}>
            {isSurvived ? <ShieldCheck className="size-3" /> : <ShieldAlert className="size-3" />}
            {isSurvived ? 'SURVIVED' : 'BREACHED'}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Input Preview */}
            <div className="relative shrink-0">
               <div className="w-28 h-28 rounded-xl bg-muted overflow-hidden border-2 border-border/50 shadow-inner group-hover:border-primary/30 transition-colors">
                  <img className="w-full h-full object-cover pixelated" src={advImageUri} alt="Adversarial input" style={{imageRendering: 'pixelated'}} />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-background border rounded-lg p-1 shadow-sm">
                  <Target className="size-4 text-primary" />
               </div>
            </div>

            {/* Confidence Radial Bar */}
            <div className="flex-1 flex items-center gap-4 w-full">
              <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                  <RechartsPrimitive.RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={chartData}
                    startAngle={90}
                    endAngle={450}
                  >
                    <RechartsPrimitive.PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                    <RechartsPrimitive.RadialBar
                      background={{ fill: 'hsl(var(--muted))' }}
                      dataKey="value"
                      cornerRadius={10}
                    />
                  </RechartsPrimitive.RadialBarChart>
                </RechartsPrimitive.ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black leading-none">{confidencePct}%</span>
                  <span className="text-[8px] uppercase tracking-tighter text-muted-foreground">Conf.</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                 <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Predicted Class</span>
                    <p className={`text-xl font-black truncate capitalize ${!isSurvived && 'text-destructive'}`}>
                      {data.adv_pred}
                    </p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${isSurvived ? 'bg-emerald-500' : 'bg-destructive'}`} />
                    <span className="text-xs text-muted-foreground">
                      {isSurvived ? 'Matches clean label' : `Fools model as ${data.adv_pred}`}
                    </span>
                 </div>
              </div>
            </div>
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Clean Baseline</p>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold capitalize">{data.clean_pred}</span>
                   <span className="text-xs font-medium text-emerald-500">{(data.clean_conf * 100).toFixed(0)}%</span>
                </div>
             </div>
             <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Adversarial</p>
                <div className="flex items-center justify-between">
                   <span className={`text-sm font-bold capitalize ${!isSurvived && 'text-destructive'}`}>{data.adv_pred}</span>
                   <span className={`text-xs font-medium ${isSurvived ? 'text-emerald-500' : 'text-destructive'}`}>{(data.adv_conf * 100).toFixed(0)}%</span>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const originalImg = result.original_image_b64 ? ensureDataUrl(result.original_image_b64) : "";
  const adversarialImg = ensureDataUrl(result.adversarial_image_b64);
  const perturbationImg = ensureDataUrl(result.perturbation_b64);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-16"
      id="compare-results"
    >
      <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-12 space-y-2">
            <h3 className="text-4xl font-black tracking-tight uppercase italic flex items-center justify-center gap-3">
              <Info className="size-8 text-primary" />
              Attack Deconstruction
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              Visualizing the mathematical noise added to the image to induce misclassification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 md:gap-2 p-10 rounded-3xl bg-card border shadow-xl relative overflow-hidden">
            {/* Background decorative path */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100" stroke="currentColor" fill="transparent" strokeWidth="0.5" />
            </svg>
            
            {/* Clean Input */}
            <div className="col-span-2 flex flex-col items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-2xl bg-muted overflow-hidden border-2 border-border shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <img src={originalImg} className="w-full h-full object-cover pixelated" alt="Original" style={{imageRendering: 'pixelated'}} />
                </div>
                <div className="absolute -top-3 -left-3 bg-background border px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-black uppercase">Input</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Clean Sample</p>
            </div>

            <div className="flex justify-center opacity-30">
              <Plus className="size-8" />
            </div>
            
            {/* Perturbation */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-muted overflow-hidden border-2 border-primary/20 shadow-lg transition-transform group-hover:rotate-6 duration-500">
                  <img src={perturbationImg} className="w-full h-full object-cover pixelated" alt="Perturbation" style={{imageRendering: 'pixelated'}} />
                </div>
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-black uppercase">Noise</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Perturbation</p>
            </div>

            <div className="flex justify-center opacity-30">
              <Equal className="size-8" />
            </div>

            {/* Adversarial Result */}
            <div className="col-span-2 flex flex-col items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-2xl bg-muted overflow-hidden border-4 border-destructive/20 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <img src={adversarialImg} className="w-full h-full object-cover pixelated" alt="Adversarial" style={{imageRendering: 'pixelated'}} />
                  <div className="absolute inset-0 bg-destructive/10 mix-blend-overlay" />
                </div>
                <div className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full shadow-sm border-2 border-background font-black">
                  <span className="text-[10px] font-black uppercase tracking-widest">Breach</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-black text-destructive uppercase tracking-[0.2em] italic">Adversarial Frame</p>
            </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto mb-10 border-l-4 border-primary pl-6 py-2">
         <h3 className="text-3xl font-black uppercase italic tracking-tighter">Model Performance</h3>
         <p className="text-muted-foreground text-sm">Real-time analysis of standard vs. robust architectures under identical conditions.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {renderResultCard("Legacy System", result.standard_model, adversarialImg, false)}
        {renderResultCard("Robust Core 1.0", result.robust_model, adversarialImg, true)}
      </div>
    </motion.section>
  );
}
