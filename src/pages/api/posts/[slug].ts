import type { APIRoute, GetStaticPaths } from "astro";
import { getEntry } from "astro:content";

export const prerender = false;


export const GET: APIRoute = async ({params, request}) => {

  const {slug} = params;
  const post = await getEntry("blog", slug as any);

  if (post) {
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }); 
  } else {
    return new Response(JSON.stringify({ error: "Post not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    }); 
  }   
}

export const POST: APIRoute = async ({params, request}) => {
  const body = await request.json();
  
  return new Response(JSON.stringify({ message: "Post received", data: body }), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const PUT: APIRoute = async ({params, request}) => {
  const body = await request.json();
  
  return new Response(JSON.stringify({ message: "Post updated", data: body }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const DELETE: APIRoute = async ({params, request}) => {
  const body = await request.json();
  
  return new Response(JSON.stringify({ message: "Post deleted", data: body }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/*** In case of static sites, we need to define the static paths for dynamic routes. This is not necessary for server output, but it's good practice to include it for better compatibility and to avoid potential issues with static hosting providers. *
 * 
 * export const getStaticPaths:GetStaticPaths = async () => {
 *  return [
 *    { params: { slug: "first-post" } },
 *    { params: { slug: "second-post" } },
 *    { params: { slug: "third-post" } },
 *  ];
 * }
 * 
 */

