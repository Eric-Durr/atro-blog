import type { APIRoute } from "astro";
import {
  getTursoClient,
  parsePostRow,
} from "../../../lib/turso";
export const prerender = false;



export const GET: APIRoute = async ({ params }) => {
  try {
    const turso = getTursoClient();
    const postId = Number(params.postId ?? "");
    const result = await turso.execute({
      sql: "SELECT id, title, likes FROM Posts WHERE id = ?",
      args: [postId],
    });
    const row = result.rows[0] as Record<string, unknown> | undefined;

    if (!row) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const post = parsePostRow(row);
    return new Response(JSON.stringify({ method: "GET", post }), {
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

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const turso = getTursoClient();
    const body = await request.json();
    const postId = Number(params.postId ?? "");
    const updates: string[] = [];
    const args: unknown[] = [];

    if (body.title !== undefined) {
      updates.push("title = ?");
      args.push(String(body.title));
    }
    if (body.likes !== undefined) {
      updates.push("likes = ?");
      args.push(Number(body.likes));
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    args.push(postId);
    const updateResult = await turso.execute({
      sql: `UPDATE Posts SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    if (Number(updateResult.rowsAffected) === 0) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const result = await turso.execute({
      sql: "SELECT id, title, likes FROM Posts WHERE id = ?",
      args: [postId],
    });
    const updatedPost = parsePostRow(
      result.rows[0] as Record<string, unknown>,
    );

    return new Response(JSON.stringify({ method: "PATCH", updatedPost }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("PATCH /posts error", error);
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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const turso = getTursoClient();
    const postId = Number(params.postId ?? "");
    const deleteResult = await turso.execute({
      sql: "DELETE FROM Posts WHERE id = ?",
      args: [postId],
    });

    if (Number(deleteResult.rowsAffected) === 0) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const postsResult = await turso.execute(
      "SELECT id, title, likes FROM Posts ORDER BY id",
    );
    const updatedPosts = postsResult.rows.map((row) =>
      parsePostRow(row as Record<string, unknown>),
    );

    return new Response(JSON.stringify({ method: "DELETE", updatedPosts }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("DELETE /posts error", error);
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
