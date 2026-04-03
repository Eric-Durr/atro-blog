import type { APIRoute, GetStaticPaths } from "astro";
import { getEntry } from "astro:content";

export const prerender = false;


export const GET: APIRoute = async ({params, request}) => {

    return new Response(JSON.stringify({ method: "GET", clientId: params.clientId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }); 
}

export const POST: APIRoute = async ({params, request}) => {
  
  return new Response(JSON.stringify({ method: "POST", clientId: params.clientId }), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const PUT: APIRoute = async ({params, request}) => {
  
  return new Response(JSON.stringify({ method: "PUT", clientId: params.clientId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const PATCH: APIRoute = async ({params, request}) => {
  
return new Response(JSON.stringify({ method: "PATCH", clientId: params.clientId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export const DELETE: APIRoute = async ({params, request}) => {
  return new Response(JSON.stringify({ method: "DELETE", clientId: params.clientId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}



