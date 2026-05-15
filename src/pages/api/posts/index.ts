import type { APIRoute } from "astro";
import { getTursoClient } from "../../../lib/turso";

export const prerender = false;

interface PostRecord {
  id: number;
  title: string;
  likes: number;
}

function parsePostRow(row: Record<string, unknown>): PostRecord {
  return {
    id: Number(row.id),
    title: String(row.title ?? ""),
    likes: Number(row.likes ?? 0),
  };
}

export const GET: APIRoute = async () => {
  try {
    const turso = getTursoClient();
    const result = await turso.execute(
      "SELECT id, title, likes FROM Posts ORDER BY id",
    );
    const posts = result.rows.map((row) =>
      parsePostRow(row as Record<string, unknown>),
    );

    return new Response(JSON.stringify({ method: "GET", posts }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GET /posts error", error);
    return new Response(
      JSON.stringify({
        error: "Error processing request",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const turso = getTursoClient();
    const payload = await request.json();
    const id = payload.id == null ? null : Number(payload.id);
    const post = {
      id,
      title: String(payload.title ?? ""),
      likes: payload.likes == null ? 0 : Number(payload.likes),
    };

    const result = await turso.execute({
      sql: "INSERT INTO Posts (id, title, likes) VALUES (?, ?, ?)",
      args: [id, post.title, post.likes],
    });

    return new Response(
      JSON.stringify({
        method: "POST",
        post: {
          ...post,
          id: id ?? Number(result.lastInsertRowid),
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("POST /posts error", error);
    return new Response(
      JSON.stringify({
        error: "Error processing request",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
