import type { ApiProblem, FieldErrors } from "@/lib/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseJsonText(value: string): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeFieldPath(path: string) {
  return path.replace(/^(body|query|params)(?:\.|$)/, "") || "form";
}

export function mapValidationDetails(value: unknown): FieldErrors | undefined {
  if (!Array.isArray(value)) return undefined;

  const fieldErrors: FieldErrors = {};

  for (const issue of value) {
    if (!isRecord(issue)) continue;

    const path = readString(issue, "path");
    const message = readString(issue, "message");
    if (!path || !message) continue;

    const field = normalizeFieldPath(path);
    fieldErrors[field] = [...(fieldErrors[field] ?? []), message];
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

type NormalizeProblemInput = {
  status?: number;
  payload?: unknown;
  code: ApiProblem["code"];
  fallbackMessage: string;
};

export function normalizeApiProblem({
  status,
  payload,
  code,
  fallbackMessage,
}: NormalizeProblemInput): ApiProblem {
  const safeStatus = Number.isInteger(status) ? status! : null;
  const body = isRecord(payload) ? payload : undefined;
  const backendMessage = body ? readString(body, "message") : undefined;
  const canUseBackendMessage =
    safeStatus !== null && safeStatus >= 400 && safeStatus < 500;
  const fieldErrors = body
    ? mapValidationDetails(body.errorDetails)
    : undefined;

  return {
    status: safeStatus,
    code,
    message:
      canUseBackendMessage && backendMessage
        ? backendMessage.slice(0, 300)
        : fallbackMessage,
    fieldErrors,
    retryable:
      code === "network" ||
      safeStatus === 408 ||
      safeStatus === 429 ||
      (safeStatus !== null && safeStatus >= 500),
  };
}
