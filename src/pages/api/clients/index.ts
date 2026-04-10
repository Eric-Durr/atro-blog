import type { APIRoute } from "astro";
import { parseClientRow, toSqlBoolean, turso } from "../../../lib/turso";


export const prerender = false;

export const GET: APIRoute = async () => {

  try {
    const result = await turso.execute(
      "SELECT id, name, age, isActive FROM Clients ORDER BY id",
    );
    const clients = result.rows.map((row) =>
      parseClientRow(row as Record<string, unknown>)
    );

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
    const payload = await request.json();
    const id = payload.id == null ? null : Number(payload.id);
    const client = {
      id,
      name: String(payload.name ?? ""),
      age: Number(payload.age),
      isActive: Boolean(payload.isActive),
    };

    const result = await turso.execute({
      sql: "INSERT INTO Clients (id, name, age, isActive) VALUES (?, ?, ?, ?)",
      args: [id, client.name, client.age, toSqlBoolean(client.isActive)],
    });

    return new Response(JSON.stringify({
      method: "POST",
      client: {
        ...client,
        id: id ?? Number(result.lastInsertRowid),
      },
    }), {
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
