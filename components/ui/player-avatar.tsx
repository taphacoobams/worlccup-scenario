"use client";

import { useState } from "react";
import { resolvePlayerPhoto } from "@/lib/player-photo";
import { cn } from "@/lib/utils";

type Props = {
  photo?: string | null;
  className?: string;
  imgClassName?: string;
};

export function PlayerAvatar({ photo, className, imgClassName }: Props) {
  const src = resolvePlayerPhoto(photo);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={cn("shrink-0 bg-white/10", className)} />;
  }

  return (
    <div className={cn("shrink-0 overflow-hidden bg-white/10", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={cn("h-full w-full object-cover", imgClassName)}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
