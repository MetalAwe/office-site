// server.ts — an HTTP server from nothing: no framework, just Bun.serve
const server = Bun.serve({
  // no port here: Bun uses $PORT if it is set, otherwise 3000
  async fetch(req) {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}${url.search}`);

    if (req.method === "GET" && url.pathname === "/") {
      return new Response("Hello from a server I wrote!\n", {
        headers: { "X-Course": "advanced-web" },
      });
    }

    if (req.method === "GET" && url.pathname === "/echo") {
      const name = url.searchParams.get("name") ?? "stranger";
      return Response.json({ hello: name });
    }

    if (req.method === "POST" && url.pathname === "/echo") {
      const body = await req.text();
      return Response.json({
        youSent: body,
        contentType: req.headers.get("content-type"),
        length: body.length,
      });
    }

    if (req.method === "GET" && url.pathname === "/time") {
      return Response.json(
        { now: new Date().toISOString() },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { error: "Not found", path: url.pathname },
      { status: 404 },
    );
  },
});

console.log(`Listening on ${server.url}`);