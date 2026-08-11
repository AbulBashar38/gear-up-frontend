"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PhotoUploadProps = {
  id: string;
  name: string;
  label: string;
  hint: string;
  accept: string;
  acceptedTypes: readonly string[];
  maxBytes: number;
  maxFiles: number;
  disabled?: boolean;
  optional?: boolean;
  defaultPreviewUrls?: string[];
  errors?: string[];
  className?: string;
};

function formatMegabytes(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;
}

function isTrustedCloudinaryUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function PhotoUpload({
  id,
  name,
  label,
  hint,
  accept,
  acceptedTypes,
  maxBytes,
  maxFiles,
  disabled = false,
  optional = false,
  defaultPreviewUrls = [],
  errors = [],
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const savedUrls = defaultPreviewUrls.filter(isTrustedCloudinaryUrl);
  const previewUrls = objectUrls.length > 0 ? objectUrls : savedUrls;
  const hasError = Boolean(localError || errors.length);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  useEffect(
    () => () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [objectUrls],
  );

  function resetSelection() {
    setSelectedFiles([]);
    setObjectUrls([]);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    if (files.length > maxFiles) {
      setLocalError(`Choose no more than ${maxFiles} images.`);
      resetInputOnly();
      return;
    }
    if (files.some((file) => !acceptedTypes.includes(file.type))) {
      setLocalError("Use only JPEG, PNG, WebP, or AVIF images.");
      resetInputOnly();
      return;
    }
    if (files.some((file) => file.size === 0 || file.size > maxBytes)) {
      setLocalError(`Each image must be ${formatMegabytes(maxBytes)} or smaller.`);
      resetInputOnly();
      return;
    }

    setLocalError(null);
    setSelectedFiles(files);
    setObjectUrls(files.map((file) => URL.createObjectURL(file)));
  }

  function resetInputOnly() {
    setSelectedFiles([]);
    setObjectUrls([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
          {optional && <span className="ml-1 font-normal text-ink/55">(optional)</span>}
        </label>
        {selectedFiles.length > 0 && (
          <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-signal">
            {selectedFiles.length} ready to upload
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={`${hintId} ${errorId}`}
        className="sr-only"
        onChange={(event) => selectFiles(event.target.files)}
      />

      <div className={cn("border bg-mist/30 p-5", hasError ? "border-destructive" : "border-ink/18")}>
        {previewUrls.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative aspect-[4/3] overflow-hidden bg-ink/8">
                  <Image
                    src={url}
                    alt={`${label} preview ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    unoptimized={url.startsWith("blob:")}
                    className="object-cover"
                  />
                  <span className="absolute left-2 top-2 bg-ink/80 px-2 py-1 font-mono text-[0.55rem] font-bold uppercase text-paper">
                    {index === 0 ? "Primary" : `Photo ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
            <p id={hintId} className="mt-4 text-xs leading-5 text-ink/60">
              {hint} {selectedFiles.length > 0
                ? "Saving replaces the current gallery; the first image becomes the catalog cover."
                : "Choose new images to replace this gallery."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="compact" disabled={disabled} onClick={() => inputRef.current?.click()}>
                <RefreshCw aria-hidden="true" />
                Replace gallery
              </Button>
              {selectedFiles.length > 0 && (
                <Button type="button" variant="destructive" size="compact" disabled={disabled} onClick={resetSelection}>
                  <X aria-hidden="true" />
                  Cancel replacement
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="grid min-h-56 place-items-center text-center">
            <div className="max-w-lg">
              <span className="mx-auto grid size-14 place-items-center bg-ink text-paper">
                <ImagePlus aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-3xl font-black uppercase">Add a gear gallery</h3>
              <p id={hintId} className="mt-3 text-sm leading-6 text-ink/60">{hint}</p>
              <Button type="button" size="lg" disabled={disabled} className="mt-6" onClick={() => inputRef.current?.click()}>
                <Upload aria-hidden="true" />
                Choose photos
              </Button>
            </div>
          </div>
        )}
      </div>

      <div id={errorId} aria-live="polite" className="space-y-1">
        {localError && <p className="text-xs font-semibold text-destructive">{localError}</p>}
        {errors.map((message) => <p key={message} className="text-xs font-semibold text-destructive">{message}</p>)}
      </div>
    </div>
  );
}
