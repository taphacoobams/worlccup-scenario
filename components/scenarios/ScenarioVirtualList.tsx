"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { useLocale } from "@/context/locale-context";
import type { EnrichedScenario } from "@/lib/scenario-engine/types";

/** Hauteur par carte (classement 4 équipes + probabilités) */
const ROW_HEIGHT = 520;
const OVERSCAN = 2;

type Props = {
  items: EnrichedScenario[];
};

export function ScenarioVirtualList({ items }: Props) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(640);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
  }, []);

  const { start, end, totalHeight, offsetY } = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visible = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
    const endIdx = Math.min(items.length, startIdx + visible);
    return {
      start: startIdx,
      end: endIdx,
      totalHeight: items.length * ROW_HEIGHT,
      offsetY: startIdx * ROW_HEIGHT,
    };
  }, [scrollTop, viewportHeight, items.length]);

  const slice = items.slice(start, end);

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16 rounded-xl border border-white/10">
        {t("scenarios.noMatch")}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="rounded-xl border border-white/10 overflow-y-auto max-h-[min(80vh,900px)]"
      style={{ minHeight: 400 }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
          }}
          className="space-y-4 px-1 py-2"
        >
          {slice.map((item, i) => (
            <div
              key={item.scenario.id}
              style={{ height: ROW_HEIGHT - 16, overflow: "visible" }}
            >
              <ScenarioCard enriched={item} index={start + i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
