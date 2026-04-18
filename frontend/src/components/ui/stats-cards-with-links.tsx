"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export interface StatCardData {
  name: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  href?: string;
  linkLabel?: string;
}

interface StatsCardsWithLinksProps {
  data: StatCardData[];
}

export default function StatsCardsWithLinks({ data }: StatsCardsWithLinksProps) {
  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {data.map((item) => (
        <Card key={item.name} className="p-0 gap-0">
          <CardContent className="p-6">
            <dd className="flex items-start justify-between space-x-2">
              <span className="truncate text-sm text-muted-foreground">
                {item.name}
              </span>
              <span
                className={cn(
                  "text-sm font-medium shrink-0",
                  item.changeType === "positive"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : item.changeType === "negative"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                )}
              >
                {item.change}
              </span>
            </dd>
            <dd className="mt-1 text-3xl font-semibold text-foreground">
              {item.value}
            </dd>
          </CardContent>
          {item.href && (
            <CardFooter className="flex justify-end border-t border-border !p-0">
              <a
                href={item.href}
                className="px-6 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {item.linkLabel ?? "View more"} →
              </a>
            </CardFooter>
          )}
        </Card>
      ))}
    </dl>
  );
}
