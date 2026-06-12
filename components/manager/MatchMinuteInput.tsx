"use client";

import { useState } from "react";
import {
  formatMatchMinuteInput,
  parseMatchMinute,
} from "@/lib/tournament-engine/events";
import { cn } from "@/lib/utils";

type MatchTime = { minute: number; addedTime?: number };

type Props = {
  value: MatchTime;
  onChange: (value: MatchTime) => void;
  onValidityChange?: (valid: boolean) => void;
  className?: string;
};

export function MatchMinuteInput({ value, onChange, onValidityChange, className }: Props) {
  const [text, setText] = useState(() =>
    formatMatchMinuteInput(value.minute, value.addedTime)
  );
  const [error, setError] = useState<string | null>(null);

  function commit(raw: string) {
    setText(raw);
    const parsed = parseMatchMinute(raw);
    if (!parsed) {
      const invalid = Boolean(raw.trim());
      setError(invalid ? "Format : 45 ou 90+2" : null);
      onValidityChange?.(!invalid);
      return;
    }
    setError(null);
    onValidityChange?.(true);
    onChange(parsed);
  }

  return (
    <label className={cn("block text-xs", className)}>
      <span className="text-muted-foreground">Minute</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="ex. 45+2"
        className={cn(
          "mt-1 w-full rounded border bg-card px-2 py-1.5 text-xs tabular-nums",
          error ? "border-destructive" : "border-white/10"
        )}
        value={text}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => {
          const parsed = parseMatchMinute(text);
          if (parsed) {
            setText(formatMatchMinuteInput(parsed.minute, parsed.addedTime));
          }
        }}
        aria-invalid={error != null}
      />
      {error ? (
        <span className="text-[10px] text-destructive mt-0.5 block">{error}</span>
      ) : (
        <span className="text-[10px] text-muted-foreground mt-0.5 block">
          45, 90 ou 45+2, 90+3…
        </span>
      )}
    </label>
  );
}
