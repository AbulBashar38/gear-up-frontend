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
  disabled?: boolean;
  optional?: boolean;
  defaultPreviewUrl?: string | null;
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
  disabled = false,
  optional = false,
  defaultPreviewUrl,
  errors = [],
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const currentPreview = isTrustedCloudinaryUrl(defaultPreviewUrl)
    ? defaultPreviewUrl
    : null;
  const previewUrl = objectUrl ?? currentPreview;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(localError || errors.length);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function openPicker() {
    inputRef.current?.click();
  }

  function selectFile(file?: File) {
    if (!file) return;

    if (!acceptedTypes.some((type) => type === file.type)) {
      setLocalError("Choose a supported image format.");
      setSelectedFile(null);
      setObjectUrl(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size === 0 || file.size > maxBytes) {
      setLocalError(`Choose an image no larger than ${formatMegabytes(maxBytes)}.`);
      setSelectedFile(null);
      setObjectUrl(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLocalError(null);
    setSelectedFile(file);
    setObjectUrl(URL.createObjectURL(file));
  }

  function cancelSelection() {
    setSelectedFile(null);
    setObjectUrl(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
          {optional && (
            <span className="ml-1 font-normal text-ink/55">(optional)</span>
          )}
        </label>
        {selectedFile && (
          <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-signal">
            Ready to upload
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={`${hintId} ${errorId}`}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      <div
        className={cn(
          "overflow-hidden border bg-mist/30 transition-colors",
          hasError ? "border-destructive" : "border-ink/18",
        )}
      >
        {previewUrl ? (
          <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]">
            <div className="relative aspect-[16/9] min-h-64 overflow-hidden bg-ink/8">
              <Image
                src={previewUrl}
                alt={
                  selectedFile
                    ? `Preview of ${selectedFile.name}`
                    : `${label} currently saved for this gear listing`
                }
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                unoptimized={previewUrl.startsWith("blob:")}
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-ink/80 px-4 py-3 text-paper backdrop-blur-sm">
                <p className="min-w-0 truncate text-xs font-bold">
                  {selectedFile?.name ?? "Current Cloudinary image"}
                </p>
                {selectedFile && (
                  <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-paper/65">
                    {formatMegabytes(selectedFile.size)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-ink/12 p-5 lg:border-l lg:border-t-0">
              <div>
                <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] text-signal">
                  {selectedFile ? "New photo selected" : "Saved photo"}
                </p>
                <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none">
                  {selectedFile ? "Review before saving" : "Keep or replace"}
                </h3>
                <p id={hintId} className="mt-4 text-xs leading-5 text-ink/60">
                  {hint}
                  {selectedFile
                    ? " This preview is local; Cloudinary upload begins when you save the form."
                    : " Choose another photo to replace the current image."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="compact"
                  disabled={disabled}
                  onClick={openPicker}
                >
                  <RefreshCw aria-hidden="true" />
                  {selectedFile ? "Choose another" : "Replace photo"}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="compact"
                    disabled={disabled}
                    onClick={cancelSelection}
                  >
                    <X aria-hidden="true" />
                    Cancel upload
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-6 text-center sm:p-10">
            <div className="max-w-md">
              <span className="mx-auto grid size-14 place-items-center bg-ink text-paper">
                <ImagePlus aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-3xl font-black uppercase">
                Add a field-ready photo
              </h3>
              <p id={hintId} className="mt-3 text-sm leading-6 text-ink/60">
                {hint}
              </p>
              <Button
                type="button"
                size="lg"
                disabled={disabled}
                className="mt-6"
                onClick={openPicker}
              >
                <Upload aria-hidden="true" />
                Choose photo
              </Button>
            </div>
          </div>
        )}
      </div>

      <div id={errorId} aria-live="polite" className="space-y-1">
        {localError && <p className="text-xs font-semibold text-destructive">{localError}</p>}
        {errors.map((message) => (
          <p key={message} className="text-xs font-semibold text-destructive">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
