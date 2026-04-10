import type { APIRoute } from "astro";
import {
  getTursoClientFromLocals,
  parseClientRow,
  toSqlBoolean,
} from "../../../lib/turso";

export const prerender = false;


export const GET: APIRoute = async ({ locals, params }) => {

  try {
    const turso = getTursoClientFromLocals(locals);
    const clientId = Number(params.clientId ?? "");
    const result = await turso.execute({
      sql: "SELECT id, name, age, isActive FROM Clients WHERE id = ?",
      args: [clientId],
    });
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const client = parseClientRow(row);
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



export const PATCH: APIRoute = async ({ locals, params, request }) => {
  
try {
    const turso = getTursoClientFromLocals(locals);
    const body = await request.json();
    const clientId = Number(params.clientId ?? "");
    const updates = [];
    const args = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      args.push(String(body.name));
    }
    if (body.age !== undefined) {
      updates.push("age = ?");
      args.push(Number(body.age));
    }
    if (body.isActive !== undefined) {
      updates.push("isActive = ?");
      args.push(toSqlBoolean(body.isActive));
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    args.push(clientId);
    const updateResult = await turso.execute({
      sql: `UPDATE Clients SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    if (Number(updateResult.rowsAffected) === 0) {
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const result = await turso.execute({
      sql: "SELECT id, name, age, isActive FROM Clients WHERE id = ?",
      args: [clientId],
    });
    const updatedClient = parseClientRow(
      result.rows[0] as Record<string, unknown>,
    );
    return new Response(JSON.stringify({ method: "PATCH", updatedClient }), {
      status: 200,
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


export const DELETE: APIRoute = async ({ locals, params }) => {
    
try {
     const turso = getTursoClientFromLocals(locals);
     const clientId = Number(params.clientId ?? "");
     const deleteResult = await turso.execute({
      sql: "DELETE FROM Clients WHERE id = ?",
      args: [clientId],
     });

     if (Number(deleteResult.rowsAffected) > 0) {
     const clientsResult = await turso.execute(
      "SELECT id, name, age, isActive FROM Clients ORDER BY id",
     );
     const updatedClients = clientsResult.rows.map((row) =>
      parseClientRow(row as Record<string, unknown>)
     );
     return new Response(JSON.stringify({ method: "DELETE", updatedClients }), {
      status: 200,
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
