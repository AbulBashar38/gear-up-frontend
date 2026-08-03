import "server-only";

import { isRecord, normalizeApiProblem, parseJsonText } from "./errors";
import type { ApiMeta, ApiResult } from "@/lib/types";

type QueryValue = string | number | boolean | null | undefined;

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

type GearUpFetchOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, QueryValue>;
  json?: unknown;
  next?: NextFetchOptions;
  fallbackMessage?: string;
};

const DEFAULT_FAILURE_MESSAGE =
  "The gear desk is taking a trail break. Try again shortly.";

function getApiBaseUrl() {
  const configuredUrl = process.env.GEARUP_API_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return configuredUrl.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function buildRequestUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return null;
  }

  const url = new URL(`${baseUrl}${path}`);

  for (const [key, rawValue] of Object.entries(query ?? {})) {
    if (rawValue === null || rawValue === undefined) continue;
    if (typeof rawValue === "string" && !rawValue.trim()) continue;
    url.searchParams.set(key, String(rawValue));
  }

  return url;
}

function readMeta(value: unknown): ApiMeta | undefined {
  if (!isRecord(value)) return undefined;

  const { page, limit, total } = value;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total)
  ) {
    return undefined;
  }

  return { page, limit, total };
}

export async function gearUpFetch<T>(
  path: string,
  options: GearUpFetchOptions = {},
): Promise<ApiResult<T>> {
  const {
    query,
    json,
    fallbackMessage = DEFAULT_FAILURE_MESSAGE,
    headers: initialHeaders,
    next,
    cache,
    ...requestInit
  } = options;
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return {
      ok: false,
      error: normalizeApiProblem({
        code: "configuration",
        fallbackMessage: "The gear desk is not connected yet.",
      }),
    };
  }

  const url = buildRequestUrl(baseUrl, path, query);
  if (!url || ((cache === "no-store" || cache === "no-cache") && next?.revalidate !== undefined)) {
    return {
      ok: false,
      error: normalizeApiProblem({
        code: "configuration",
        fallbackMessage: "This request is not configured correctly.",
      }),
    };
  }

  const headers = new Headers(initialHeaders);
  if (json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...requestInit,
      cache,
      next,
      headers,
      body: json === undefined ? undefined : JSON.stringify(json),
    });
    const payload = parseJsonText(await response.text());

    if (!response.ok || !isRecord(payload) || payload.success !== true) {
      return {
        ok: false,
        error: normalizeApiProblem({
          status: response.status,
          payload,
          code: response.ok ? "invalid-response" : "http",
          fallbackMessage,
        }),
      };
    }

    if (!("data" in payload)) {
      return {
        ok: false,
        error: normalizeApiProblem({
          status: response.status,
          code: "invalid-response",
          fallbackMessage,
        }),
      };
    }

    return {
      ok: true,
      status: response.status,
      message:
        typeof payload.message === "string"
          ? payload.message
          : "Request completed successfully.",
      data: payload.data as T,
      meta: readMeta(payload.meta),
    };
  } catch {
    return {
      ok: false,
      error: normalizeApiProblem({
        code: "network",
        fallbackMessage,
      }),
    };
  }
}
