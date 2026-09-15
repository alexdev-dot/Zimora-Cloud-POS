"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: "segmented" | "underline";
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "segmented", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      variant === "segmented" &&
        "inline-flex items-center gap-0.5 rounded-lg bg-muted p-1 text-muted-foreground",
      variant === "underline" &&
        "flex items-center gap-5 overflow-x-auto border-b border-border",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: "segmented" | "underline";
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = "segmented", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-medium transition-all focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
      variant === "segmented" &&
        "rounded-md px-3 py-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      variant === "underline" &&
        "-mb-px border-b-2 border-transparent px-1 pb-2.5 pt-1 text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none data-[state=active]:animate-fade-in", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
