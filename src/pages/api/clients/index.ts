import type { APIRoute } from "astro";
import { Clients, db } from "astro:db";
import type { bool } from "sharp";


export const prerender = false;

export const GET: APIRoute = async ({ request }) => {

  try {
  const clients = await db.select().from(Clients).all();

    return new Response(JSON.stringify({method: "GET", clients}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GET /clients error", error);
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
      }
    );
  }
};


export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, ...body } = await request.json();
    
    const {lastInsertRowid} =  await db.insert(Clients).values({
      id,
      ...body
    });
    return new Response(JSON.stringify({ method: "POST", id: +lastInsertRowid!.toString(),body }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("POST /clients error", error);
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
      }
    );
  }
}



export const PUT: APIRoute = async ({ request }) => {
  
  return new Response(JSON.stringify({ method: "PUT" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const DELETE: APIRoute = async ({ request }) => {
  
  return new Response(JSON.stringify({ method: "DELETE" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const PATCH: APIRoute = async ({ request }) => {
  
  return new Response(JSON.stringify({ method: "PATCH" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
