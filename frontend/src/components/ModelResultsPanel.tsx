import { useState } from "react";
import { api, type ModelResults, type PerClassResult } from "@/services/api";
import { Button } from "./ui/button";

import RadialStatsGrid, { type RadialStatItem } from "./ui/radial-stats-grid";
import AnimatedProgressBar from "./ui/animated-progress-bar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ExternalLink } from "lucide-react";

// ── Colour palette ─────────────────────────────────────────────────────────────
const STD_COLOR = "#f97316"; // Orange
const ROB_COLOR = "#6366f1"; // Indigo



function mapToRadialItems(perClass: PerClassResult[]): RadialStatItem[] {
  return perClass.map((row, i) => {
    const robustVal = parseFloat(row.Robust.replace("%", ""));
    return {
      name: row.Class,
      capacity: Math.round(robustVal),
      label: `Rob ${row.Robust} · Std ${row.Standard}`,
      fill: `var(--color-class${i})`,
      configKey: `class${i}`,
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ModelResultsPanel() {
  const [results, setResults]   = useState<ModelResults | null>(null);
  const [perClass, setPerClass] = useState<PerClassResult[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [visible, setVisible]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFetch = async () => {
    if (visible) {
      setVisible(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [r, p] = await Promise.all([
        api.getModelResults(),
        api.getPerClassResults(),
      ]);
      setResults(r);
      setPerClass(p);
      setRefreshKey(prev => prev + 1);
      setVisible(true);
      setTimeout(() => {
        document.getElementById("model-results-panel")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      setError((e as Error).message + ". Have you run Notebook 4?");
    } finally {
      setLoading(false);
    }
  };


  const radialItems = perClass ? mapToRadialItems(perClass)  : [];

  return (
    <>
      {/* ── Trigger Button ── */}
      <div className="flex justify-center py-10">
        <Button
          id="view-results-btn"
          onClick={handleFetch}
          disabled={loading}
          variant={visible ? "outline" : "default"}
          className="gap-2 px-8 py-5 text-base font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading…
            </>
          ) : visible ? (
            "✕ Hide Benchmark Results"
          ) : (
            "📊 View Benchmark Results"
          )}
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="container mx-auto px-4 mb-6">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 px-6 py-4 text-sm">
            ⚠ {error}
          </div>
        </div>
      )}

      {/* ── Panel ── */}
      {visible && results && perClass && (
        <section id="model-results-panel" className="container mx-auto px-4 pb-24 space-y-14">

          {/* ── Header ── */}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Benchmark Results</h2>
            <p className="text-muted-foreground text-sm">
              Full CIFAR-10 evaluation — Comparing System Resilience.{" "}
              <a
                href="https://arxiv.org/abs/1706.06083"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline hover:underline-offset-4"
              >
                Madry et al. (2018) <ExternalLink className="size-3" />
              </a>
            </p>
          </div>

          {/* ── Individual Scenario Cards with Animated Progress Bar ── */}
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(results).map(([scenario, vals]) => (
              <Card key={scenario} className="bg-card/40 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                   <span className="text-xs font-black uppercase tracking-widest text-primary/70">{scenario}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatedProgressBar
                    key={`std-${scenario}-${refreshKey}`}
                    value={vals.Standard}
                    color={STD_COLOR}
                    label={`Standard Model: ${vals.Standard.toFixed(1)}%`}
                    labelClassName="text-xs uppercase font-bold text-muted-foreground tracking-tighter"
                  />
                  <AnimatedProgressBar
                    key={`rob-${scenario}-${refreshKey}`}
                    value={vals.Robust}
                    color={ROB_COLOR}
                    label={`Robust Model: ${vals.Robust.toFixed(1)}%`}
                    labelClassName="text-xs uppercase font-bold text-indigo-500/80 tracking-tighter"
                  />
                  <div className="flex justify-end pt-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        vals.Robust >= vals.Standard 
                          ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' 
                          : 'border-red-500/20 text-red-500 bg-red-500/5'
                     }`}>
                        DELTA: {(vals.Robust - vals.Standard).toFixed(1)}%
                     </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>



          {/* ── Radial Grid ── */}
          <RadialStatsGrid
            title="Per-class adversarial accuracy (PGD-10, ε = 8/255)"
            subtitle={
              <>
                Breakdown showing how each CIFAR-10 class survives under the{" "}
                <span className="font-bold text-foreground">Robust Core</span>. 
                The standard model collapses to nearly 0% in all these scenarios.
              </>
            }
            items={radialItems}
          />

          {/* ── Key insight ── */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-sm text-muted-foreground leading-relaxed italic shadow-inner">
            <span className="font-black text-foreground not-italic uppercase tracking-wider text-xs mr-2">Core Insight:</span>
            While physical accuracy drops slightly on clean data, the 
            total system resilience under state-of-the-art attacks (PGD) increases 
            from <span className="text-red-500 font-bold">~0%</span> to over 
            <span className="text-indigo-500 font-bold"> 40%</span>.
          </div>
        </section>
      )}
    </>
  );
}
