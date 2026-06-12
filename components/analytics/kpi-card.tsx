"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "green" | "gold" | "default";
  delay?: number;
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "default",
  delay = 0,
}: KpiCardProps) {
  const accentClass = {
    green: "from-senegal-green/20 to-transparent border-senegal-green/30",
    gold: "from-gold/20 to-transparent border-gold/30",
    default: "from-white/5 to-transparent border-white/10",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn("bg-gradient-to-br overflow-hidden", accentClass)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="rounded-lg bg-white/5 p-2">
            <Icon className="h-4 w-4 text-gold" aria-hidden />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-senegal-green mt-2 font-medium">{trend}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
