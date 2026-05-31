import type { ValidationIssue } from "@/lib/calculations/common/resultTypes";

export function requirePositiveNumber(
  value: unknown,
  field: string,
  label: string,
): ValidationIssue[] {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return [{ field, message: `${label} must be a number.` }];
  }

  if (!Number.isFinite(value) || value <= 0) {
    return [{ field, message: `${label} must be greater than zero.` }];
  }

  return [];
}

export function requireNonNegativeNumber(
  value: unknown,
  field: string,
  label: string,
): ValidationIssue[] {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return [{ field, message: `${label} must be a number.` }];
  }

  if (!Number.isFinite(value) || value < 0) {
    return [{ field, message: `${label} must be zero or greater.` }];
  }

  return [];
}

export function optionalNonNegativeNumber(
  value: unknown,
  field: string,
  label: string,
): ValidationIssue[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requireNonNegativeNumber(value, field, label);
}

export function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, digits = 3): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}
