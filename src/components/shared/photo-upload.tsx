"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
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

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
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

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
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
  const pendingImagesRef = useRef<PendingImage[]>([]);
  const [savedUrls, setSavedUrls] = useState(() =>
    Array.from(new Set(defaultPreviewUrls.filter(isTrustedCloudinaryUrl))).slice(
      0,
      maxFiles,
    ),
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const totalImages = savedUrls.length + pendingImages.length;
  const remainingSlots = maxFiles - totalImages;
  const hasError = Boolean(localError || errors.length);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(
    () => () => {
      pendingImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    },
    [],
  );

  function syncFileInput(images: PendingImage[]) {
    if (!inputRef.current) return;
    const transfer = new DataTransfer();
    images.forEach((image) => transfer.items.add(image.file));
    inputRef.current.files = transfer.files;
  }

  function selectFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    if (files.some((file) => !acceptedTypes.includes(file.type))) {
      setLocalError("Use only JPEG, PNG, WebP, or AVIF images.");
      syncFileInput(pendingImages);
      return;
    }
    if (files.some((file) => file.size === 0 || file.size > maxBytes)) {
      setLocalError(`Each image must be ${formatMegabytes(maxBytes)} or smaller.`);
      syncFileInput(pendingImages);
      return;
    }

    const knownFiles = new Set(
      pendingImages.map((image) => fileIdentity(image.file)),
    );
    const uniqueFiles = files.filter((file) => {
      const identity = fileIdentity(file);
      if (knownFiles.has(identity)) return false;
      knownFiles.add(identity);
      return true;
    });
    if (uniqueFiles.length === 0) {
      setLocalError("Those images are already selected.");
      syncFileInput(pendingImages);
      return;
    }

    const acceptedFiles = uniqueFiles.slice(0, remainingSlots);
    const ignoredCount = uniqueFiles.length - acceptedFiles.length;
    const additions = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    const nextImages = [...pendingImages, ...additions];
    setLocalError(
      ignoredCount > 0
        ? `The gallery allows ${maxFiles} images. Kept ${acceptedFiles.length} from this selection and ignored ${ignoredCount} extra ${ignoredCount === 1 ? "image" : "images"}.`
        : null,
    );
    setPendingImages(nextImages);
    syncFileInput(nextImages);
  }

  function removeSavedImage(url: string) {
    setSavedUrls((current) => current.filter((savedUrl) => savedUrl !== url));
    setLocalError(null);
  }

  function removePendingImage(id: string) {
    const removed = pendingImages.find((image) => image.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    const nextImages = pendingImages.filter((image) => image.id !== id);
    setPendingImages(nextImages);
    syncFileInput(nextImages);
    setLocalError(null);
  }

  const previews = [
    ...savedUrls.map((url) => ({
      id: url,
      url,
      kind: "saved" as const,
    })),
    ...pendingImages.map((image) => ({
      id: image.id,
      url: image.previewUrl,
      kind: "new" as const,
    })),
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
          {optional && (
            <span className="ml-1 font-normal text-ink/55">(optional)</span>
          )}
        </label>
        {totalImages > 0 && (
          <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-signal">
            {savedUrls.length} saved · {pendingImages.length} new · {totalImages}/
            {maxFiles} total
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
        disabled={disabled || remainingSlots === 0}
        aria-invalid={hasError}
        aria-describedby={`${hintId} ${errorId}`}
        className="sr-only"
        onChange={(event) => selectFiles(event.target.files)}
      />

      {savedUrls.map((url) => (
        <input
          key={url}
          type="hidden"
          name="retainedImageUrls"
          value={url}
        />
      ))}

      <div
        className={cn(
          "border bg-mist/30 p-5",
          hasError ? "border-destructive" : "border-ink/18",
        )}
      >
        {previews.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {previews.map((preview, index) => (
                <div
                  key={`${preview.kind}:${preview.id}`}
                  className="relative aspect-[4/3] overflow-hidden bg-ink/8"
                >
                  <Image
                    src={preview.url}
                    alt={`${label} preview ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    unoptimized={preview.kind === "new"}
                    className="object-cover"
                  />
                  <span className="absolute left-2 top-2 bg-ink/80 px-2 py-1 font-mono text-[0.55rem] font-bold uppercase text-paper">
                    {index === 0 ? "Primary" : `Photo ${index + 1}`} ·{" "}
                    {preview.kind === "saved" ? "Saved" : "New"}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={disabled}
                    aria-label={`Remove ${index === 0 ? "primary" : `photo ${index + 1}`} from gallery`}
                    className="absolute right-2 top-2 bg-paper text-destructive shadow-md hover:bg-destructive hover:text-paper"
                    onClick={() =>
                      preview.kind === "saved"
                        ? removeSavedImage(preview.url)
                        : removePendingImage(preview.id)
                    }
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
            <p id={hintId} className="mt-4 text-xs leading-5 text-ink/60">
              {hint} Remove any photo with its close button or add more below.
              Changes are applied only after you submit the form.
            </p>
            <Button
              type="button"
              variant="outline"
              size="compact"
              disabled={disabled || remainingSlots === 0}
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              {remainingSlots === 0
                ? "Gallery is full"
                : `Add ${remainingSlots === 1 ? "one more photo" : "more photos"}`}
            </Button>
          </>
        ) : (
          <div className="grid min-h-56 place-items-center text-center">
            <div className="max-w-lg">
              <span className="mx-auto grid size-14 place-items-center bg-ink text-paper">
                <ImagePlus aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-3xl font-black uppercase">
                Add a gear gallery
              </h3>
              <p id={hintId} className="mt-3 text-sm leading-6 text-ink/60">
                {hint} Images upload only after you submit the form.
              </p>
              <Button
                type="button"
                size="lg"
                disabled={disabled}
                className="mt-6"
                onClick={() => inputRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                Choose photos
              </Button>
            </div>
          </div>
        )}
      </div>

      <div id={errorId} aria-live="polite" className="space-y-1">
        {localError && (
          <p className="text-xs font-semibold text-destructive">{localError}</p>
        )}
        {errors.map((message) => (
          <p key={message} className="text-xs font-semibold text-destructive">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
