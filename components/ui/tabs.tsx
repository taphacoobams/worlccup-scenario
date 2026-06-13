"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

function tabsListClass(className?: string) {
  return cn(
    "inline-flex h-auto items-center justify-center rounded-xl bg-surface-light/50 border border-border p-1 text-text-secondary gap-1",
    className
  );
}

function tabsTriggerClass(className?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
    "data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm",
    "hover:text-text",
    className
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListClass, tabsTriggerClass };
