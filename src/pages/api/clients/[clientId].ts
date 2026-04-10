import type { APIRoute, GetStaticPaths } from "astro";
import { getEntry } from "astro:content";
import { db, Clients, eq} from "astro:db";

export const prerender = false;


export const GET: APIRoute = async ({params, request }) => {

  try {
    const clientId = params.clientId ?? '';

  const client = await db.select().from(Clients).where(eq(Clients.id, +clientId)).get();
  if (!client) {
    return new Response(JSON.stringify({ error: "Client not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
    return new Response(JSON.stringify({method: "GET", client}), {
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



export const PATCH: APIRoute = async ({params, request}) => {
  
try {
    const { id, ...body } = await request.json();
    const clientId = params.clientId ?? '';
     await db.update(Clients).set(body).where(eq(Clients.id, +clientId));
     const updatedClient = await db.select().from(Clients).where(eq(Clients.id, +clientId)).get();
     return new Response(JSON.stringify({ method: "PATCH", updatedClient }), {
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


export const DELETE: APIRoute = async ({params, request}) => {
    
try {
     const clientId = params.clientId ?? '';
     const {rowsAffected} = await db.delete(Clients).where(eq(Clients.id, +clientId));
     const updatedClients = await db.select().from(Clients);
     if (rowsAffected>0) {
     return new Response(JSON.stringify({ method: "DELETE", updatedClients }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
      
      });
    } else {
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
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



