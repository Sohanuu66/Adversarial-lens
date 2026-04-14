import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ShieldAlert } from "lucide-react";

export function Navbar() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.checkHealth();
        setIsHealthy(res.status === "ok");
      } catch (err) {
        setIsHealthy(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span className="font-['Space_Grotesk'] tracking-tighter">ADVERSARIAL <span className="text-primary font-black">LENS</span></span>
        </div>
        <div className="flex items-center gap-2">
          {isHealthy === null ? (
            <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
          ) : (
            <>
              <div 
                 className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-tertiary animate-pulse' : 'bg-destructive'}`} 
              />
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
                {isHealthy ? "API Connected" : "API Offline"}
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
