import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { UploadSection } from "./components/UploadSection";
import { CompareResults } from "./components/CompareResults";
import { ExplainResults } from "./components/ExplainResults";
import { ModelResultsPanel } from "./components/ModelResultsPanel";
import { api, type CompareRequest, type CompareResponse, type ExplainResponse } from "./services/api";

function App() {
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [explainResult, setExplainResult] = useState<ExplainResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  // Default to dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleCompare = async (req: CompareRequest) => {
    try {
      setIsComparing(true);
      setExplainResult(null); // Clear previous heatmaps
      const res = await api.compareModels(req);
      setCompareResult(res);
      setTimeout(() => {
        document.getElementById('compare-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleExplain = async (req: CompareRequest) => {
    try {
      setIsExplaining(true);
      const res = await api.explainModels(req);
      setExplainResult(res);
      setTimeout(() => {
        document.getElementById('explain-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as Error).message);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Navbar />
      <Hero />
      <div className="relative z-10 w-full bg-background border-t">
        <UploadSection
          onCompare={handleCompare}
          onExplain={handleExplain}
          isAnalyzing={isComparing || isExplaining}
        />

        {/* Benchmark Results Panel — always available */}
        <ModelResultsPanel />

        {(isComparing || compareResult) && (
          <CompareResults result={compareResult} isLoading={isComparing} />
        )}
        {(isExplaining || explainResult) && (
          <ExplainResults result={explainResult} isLoading={isExplaining} />
        )}
      </div>
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground mt-20 border-t">
        <p>Adversarial Lens &copy; 2026. Built for demonstrating robustness in ML models.</p>
      </footer>
    </div>
  );
}

export default App;
