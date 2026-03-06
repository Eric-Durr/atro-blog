import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";


export const GET: APIRoute = async ({ request }) => {
  const posts = await getCollection("blog");

  const url = new URL(request.url);
  console.log("URL:", url);
  const slug = url.searchParams.get("slug");
console.log("Slug:", slug);
  if (slug) {
    const post = await getEntry("blog", slug);
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
  } else {
    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
