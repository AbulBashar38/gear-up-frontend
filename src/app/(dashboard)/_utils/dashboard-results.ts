import type { ApiProblem, ApiResult } from "@/lib/types";

export function getResultTotal<T>(result: ApiResult<T[]>) {
  if (!result.ok) return null;
  return result.meta?.total ?? result.data.length;
}

export function collectApiProblems(
  ...results: ApiResult<unknown>[]
): ApiProblem[] {
  return results.flatMap((result) => (result.ok ? [] : [result.error]));
}
