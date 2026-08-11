import "server-only";

import {
  v2 as cloudinary,
  type UploadApiResponse,
} from "cloudinary";
import {
  GEAR_IMAGE_MAX_BYTES,
  GEAR_IMAGE_MIME_TYPES,
} from "@/lib/image-upload";

export type CloudinaryUploadResult =
  | { ok: true; url: string; publicId: string }
  | { ok: false; message: string };

export type CloudinaryGalleryUploadResult =
  | { ok: true; images: Array<{ url: string; publicId: string }> }
  | { ok: false; message: string };

const DEFAULT_GEAR_FOLDER = "gearup/gear";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) return false;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return true;
}

function getGearFolder() {
  const configured = process.env.CLOUDINARY_GEAR_FOLDER?.trim();
  if (
    configured &&
    /^[a-zA-Z0-9/_-]+$/.test(configured) &&
    !configured.includes("..")
  ) {
    return configured;
  }

  return DEFAULT_GEAR_FOLDER;
}

function isCloudinarySecureUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function uploadGearImage(
  file: File,
): Promise<CloudinaryUploadResult> {
  if (
    file.size === 0 ||
    file.size > GEAR_IMAGE_MAX_BYTES ||
    !GEAR_IMAGE_MIME_TYPES.some((type) => type === file.type)
  ) {
    return {
      ok: false,
      message: "Choose a JPEG, PNG, WebP, or AVIF image up to 5 MB.",
    };
  }

  if (!configureCloudinary()) {
    return {
      ok: false,
      message:
        "Image upload is not configured. Add the server-side Cloudinary credentials and try again.",
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: getGearFolder(),
            allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
            unique_filename: true,
            overwrite: false,
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error("Cloudinary returned no upload result."));
              return;
            }
            resolve(uploaded);
          },
        )
        .end(buffer);
    });

    if (!result.public_id || !isCloudinarySecureUrl(result.secure_url)) {
      if (result.public_id) await removeUploadedGearImage(result.public_id);
      return {
        ok: false,
        message: "Cloudinary returned an invalid image response. Try again.",
      };
    }

    return { ok: true, url: result.secure_url, publicId: result.public_id };
  } catch {
    return {
      ok: false,
      message: "The image could not be uploaded to Cloudinary. Try again.",
    };
  }
}

export async function removeUploadedGearImage(publicId: string) {
  if (!configureCloudinary()) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch {
    // Best-effort cleanup must not hide the authoritative backend error.
  }
}

export async function uploadGearImages(
  files: File[],
): Promise<CloudinaryGalleryUploadResult> {
  const images: Array<{ url: string; publicId: string }> = [];

  for (const file of files) {
    const result = await uploadGearImage(file);
    if (!result.ok) {
      await Promise.all(
        images.map((image) => removeUploadedGearImage(image.publicId)),
      );
      return result;
    }
    images.push({ url: result.url, publicId: result.publicId });
  }

  return { ok: true, images };
}
