"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function GearGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const [selected, setSelected] = useState(images[0]);

  const current = selected && images.includes(selected) ? selected : images[0];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <div className="relative min-h-[25rem] overflow-hidden border border-paper/15 bg-orange text-ink sm:min-h-[34rem]">
        <Image
          src={current}
          alt={`${name} gallery image ${images.indexOf(current) + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
        <Badge
          variant="outline"
          className="absolute bottom-5 left-5 h-auto rounded-none border-current/35 bg-paper/90 px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink"
        >
          Provider gallery · {images.length} {images.length === 1 ? "photo" : "photos"}
        </Badge>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2" aria-label={`${name} gallery thumbnails`}>
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show ${name} photo ${index + 1}`}
              aria-pressed={current === image}
              onClick={() => setSelected(image)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden border-2 bg-paper",
                current === image ? "border-lime" : "border-paper/25 hover:border-paper/70",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
