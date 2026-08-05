export function getTrustedGearImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
