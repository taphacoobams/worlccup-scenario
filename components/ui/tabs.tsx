"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

function tabsListClass(className?: string) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-lg bg-white/5 p-1 text-muted-foreground",
    className
  );
}

function tabsTriggerClass(className?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
    className
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListClass, tabsTriggerClass };
