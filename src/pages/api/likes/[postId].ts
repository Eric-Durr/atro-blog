import type { APIRoute } from "astro";

import { getTursoClient } from "../../../lib/turso";

export const prerender = false;

function getNumericPostId(value: string | undefined) {
  const postId = Number(value ?? "");
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const postId = getNumericPostId(params.postId);

    if (postId == null) {
      return new Response(JSON.stringify({ error: "Invalid post id" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const turso = getTursoClient();
    const result = await turso.execute({
      sql: "SELECT likes FROM Posts WHERE id = ?",
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

    return new Response(
      JSON.stringify({
        method: "GET",
        postId,
        likes: Number(row.likes ?? 0),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("GET /likes/[postId] error", error);
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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const postId = getNumericPostId(params.postId);

    if (postId == null) {
      return new Response(JSON.stringify({ error: "Invalid post id" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const turso = getTursoClient();
    const body = await request.json();
    const incomingLikes = Number(body.likes ?? 0);

    if (!Number.isInteger(incomingLikes) || incomingLikes <= 0) {
      return new Response(JSON.stringify({ error: "Invalid likes payload" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const result = await turso.execute({
      sql: "UPDATE Posts SET likes = likes + ? WHERE id = ? RETURNING likes",
      args: [incomingLikes, postId],
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

    return new Response(
      JSON.stringify({
        method: "PUT",
        postId,
        likes: Number(row.likes ?? 0),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("PUT /likes/[postId] error", error);
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
