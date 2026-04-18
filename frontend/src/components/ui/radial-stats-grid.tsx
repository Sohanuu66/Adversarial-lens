"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as RechartsPrimitive from "recharts";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ── Chart infrastructure ─────────────────────────────────────────────────────
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c.theme || c.color
  );
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}`
          )
          .join("\n"),
      }}
    />
  );
};

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RadialStatItem {
  name: string;
  /** percentage 0-100 */
  capacity: number;
  label: string;
  fill: string;
  configKey: string;
}

export interface RadialStatsGridProps {
  title?: string;
  subtitle?: React.ReactNode;
  items: RadialStatItem[];
}

// Colour palette for up to 10 items (CIFAR-10 classes)
const PALETTE = [
  { light: "hsl(200,70%,50%)",  dark: "hsl(200,70%,65%)"  },
  { light: "hsl(145,60%,45%)",  dark: "hsl(145,60%,60%)"  },
  { light: "hsl(340,70%,55%)",  dark: "hsl(340,70%,70%)"  },
  { light: "hsl(280,65%,55%)",  dark: "hsl(280,65%,70%)"  },
  { light: "hsl(30, 80%,50%)",  dark: "hsl(30, 80%,65%)"  },
  { light: "hsl(60, 70%,45%)",  dark: "hsl(60, 70%,60%)"  },
  { light: "hsl(170,65%,40%)",  dark: "hsl(170,65%,55%)"  },
  { light: "hsl(220,70%,55%)",  dark: "hsl(220,70%,70%)"  },
  { light: "hsl(10, 75%,55%)",  dark: "hsl(10, 75%,70%)"  },
  { light: "hsl(250,65%,60%)",  dark: "hsl(250,65%,75%)"  },
];

export function buildChartConfig(items: RadialStatItem[]): ChartConfig {
  const config: ChartConfig = {
    background: {
      label: "Background",
      theme: { light: "hsl(210,40%,93%)", dark: "hsl(210,40%,18%)" },
    },
  };
  items.forEach((item, i) => {
    const p = PALETTE[i % PALETTE.length];
    config[item.configKey] = {
      label: item.name,
      theme: { light: p.light, dark: p.dark },
    };
  });
  return config;
}

export default function RadialStatsGrid({
  title = "Per-class robustness",
  subtitle,
  items,
}: RadialStatsGridProps) {
  const config = buildChartConfig(items);

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      )}
      {subtitle && (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      )}
      <dl
        className={cn(
          "mt-6 grid grid-cols-2 gap-4",
          items.length <= 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-3 lg:grid-cols-5"
        )}
      >
        {items.map((item) => (
          <Card key={item.name} className="p-4">
            <CardContent className="p-0 flex items-center space-x-3">
              {/* radial chart */}
              <div className="relative shrink-0 flex items-center justify-center">
                <ChartContainer
                  config={config}
                  className="h-[76px] w-[76px]"
                  id={item.configKey}
                >
                  <RechartsPrimitive.RadialBarChart
                    data={[
                      {
                        capacity: item.capacity,
                        fill: `var(--color-${item.configKey})`,
                      },
                    ]}
                    innerRadius={26}
                    outerRadius={34}
                    barSize={7}
                    startAngle={90}
                    endAngle={450}
                  >
                    <RechartsPrimitive.PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                      axisLine={false}
                    />
                    <RechartsPrimitive.RadialBar
                      dataKey="capacity"
                      background={{ fill: "var(--color-background)" }}
                      cornerRadius={10}
                      angleAxisId={0}
                    />
                  </RechartsPrimitive.RadialBarChart>
                </ChartContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">
                    {item.capacity}%
                  </span>
                </div>
              </div>
              {/* label */}
              <div className="min-w-0">
                <dt className="text-sm font-medium text-foreground capitalize truncate">
                  {item.name}
                </dt>
                <dd className="text-xs text-muted-foreground mt-0.5">
                  {item.label}
                </dd>
              </div>
            </CardContent>
          </Card>
        ))}
      </dl>
    </div>
  );
}
