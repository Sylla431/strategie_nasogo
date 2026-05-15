const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Format: {uuid}/{timestamp}-{random}.{jpg|jpeg|png|webp} */
const CARD_PATH_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/\d+-[a-z0-9]+\.(jpe?g|png|webp)$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isValidStudentCardPath(path: string, ownerUserId?: string): boolean {
  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.startsWith("/")) return false;
  if (!CARD_PATH_REGEX.test(trimmed)) return false;
  if (ownerUserId) {
    const prefix = `${ownerUserId}/`;
    if (!trimmed.startsWith(prefix)) return false;
  }
  return true;
}

export function detectImageMime(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

export function extensionForMime(mime: "image/jpeg" | "image/png" | "image/webp"): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

export const STUDENT_FIELD_LIMITS = {
  fullName: 200,
  phone: 30,
  email: 254,
} as const;

/** Garde uniquement les chiffres (0-9). */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = sanitizePhoneInput(value);
  return digits.length === 0 || (digits.length >= 8 && digits.length <= STUDENT_FIELD_LIMITS.phone);
}
