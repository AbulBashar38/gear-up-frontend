export const GEAR_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const GEAR_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const GEAR_IMAGE_ACCEPT = GEAR_IMAGE_MIME_TYPES.join(",");
