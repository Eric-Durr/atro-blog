import { createClient } from "@libsql/client/web";
import { env as cloudflareEnv } from "cloudflare:workers";

interface TursoEnv {
  ASTRO_DB_REMOTE_URL?: string;
  ASTRO_DB_APP_TOKEN?: string;
}

interface RuntimeLocals {
  runtime?: {
    env?: TursoEnv;
  };
}

const clientCache = new Map<string, ReturnType<typeof createClient>>();

function resolveTursoEnv(runtimeEnv?: TursoEnv) {
  const url =
    runtimeEnv?.ASTRO_DB_REMOTE_URL ??
    cloudflareEnv.ASTRO_DB_REMOTE_URL ??
    import.meta.env.ASTRO_DB_REMOTE_URL;
  const authToken =
    runtimeEnv?.ASTRO_DB_APP_TOKEN ??
    cloudflareEnv.ASTRO_DB_APP_TOKEN ??
    import.meta.env.ASTRO_DB_APP_TOKEN;

  if (!url) {
    throw new Error("Missing ASTRO_DB_REMOTE_URL");
  }

  if (!authToken) {
    throw new Error("Missing ASTRO_DB_APP_TOKEN");
  }

  return { url, authToken };
}

export function getTursoClient(runtimeEnv?: TursoEnv) {
  const { url, authToken } = resolveTursoEnv(runtimeEnv);
  const cacheKey = `${url}:${authToken}`;

  const cachedClient = clientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = createClient({
    url,
    authToken,
  });

  clientCache.set(cacheKey, client);
  return client;
}

export function getTursoClientFromLocals(locals?: RuntimeLocals) {
  return getTursoClient(locals?.runtime?.env);
}

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
