type JsonPrimitive = string | number | boolean | null;

export type JsonInput =
 | string
 | number
 | boolean
 | JsonInputObject
 | JsonInputArray;

export type JsonInputObject = {
 [key: string]: JsonInput | null;
};

export type JsonInputArray = Array<JsonInput | null>;

function normalizeJson(value: unknown): JsonInput | null {
 if (value === undefined || value === null) {
 return null;
 }

 if (typeof value === "bigint") {
 return value.toString();
 }

 if (value instanceof Date) {
 return value.toISOString();
 }

 if (
 typeof value === "string" ||
 typeof value === "number" ||
 typeof value === "boolean"
 ) {
 return value;
 }

 if (Array.isArray(value)) {
 return value.map((item) => normalizeJson(item));
 }

 if (typeof value === "object") {
 return Object.fromEntries(
 Object.entries(value as Record<string, unknown>)
 .filter(([, item]) => item !== undefined)
 .map(([key, item]) => [key, normalizeJson(item)]),
 ) as JsonInputObject;
 }

 return String(value);
}

export function toJsonSafe(value: unknown): JsonInput {
 const normalized = normalizeJson(value ?? {});

 if (normalized === null) {
 return {};
 }

 return JSON.parse(JSON.stringify(normalized)) as JsonInput;
}

export function compactObject<T extends Record<string, unknown>>(
 value: T,
): Partial<T> {
 return Object.fromEntries(
 Object.entries(value).filter(([, item]) => item !== undefined),
 ) as Partial<T>;
}