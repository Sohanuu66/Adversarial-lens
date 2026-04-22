import { BackgroundPaths } from "./ui/background-paths";

export function Hero({ onBegin }: { onBegin?: () => void }) {
  return (
    <section className="relative w-full">
      <BackgroundPaths 
        title="Adversarial Lens" 
        subtitle="Visualize, attack, and understand the hidden vulnerabilities of machine learning models."
        onBegin={onBegin}
      />
    </section>
  );
}
