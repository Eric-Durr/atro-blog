import { createClient } from "@libsql/client/web";

const url = import.meta.env.ASTRO_DB_REMOTE_URL;
const authToken = import.meta.env.ASTRO_DB_APP_TOKEN;

if (!url) {
  throw new Error("Missing ASTRO_DB_REMOTE_URL");
}

if (!authToken) {
  throw new Error("Missing ASTRO_DB_APP_TOKEN");
}

export const turso = createClient({
  url,
  authToken,
});

export interface ClientRecord {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
}

export function parseClientRow(row: Record<string, unknown>): ClientRecord {
  return {
    id: Number(row.id),
    name: String(row.name ?? ""),
    age: Number(row.age),
    isActive: typeof row.isActive === "boolean"
      ? row.isActive
      : Number(row.isActive) === 1,
  };
}

export function toSqlBoolean(value: unknown): number {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}
