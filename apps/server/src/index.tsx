// src/index.tsx — the office site

import { readdir } from "node:fs/promises";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { buildings, team } from "./data";
import { entrancesApi } from "./entrances";
import { etaPages } from "./eta-pages";
import { stringPages } from "./string-pages";
import { Layout } from "./views/Layout";

interface Env {
  Variables: { requestId: string };
}
const app = new Hono<Env>();

app.use(logger());

// step 8: a middleware of our own
app.use(async (c, next) => {
  const started = performance.now();
  c.set("requestId", crypto.randomUUID().slice(0, 8));
  await next();
  const ms = (performance.now() - started).toFixed(1);
  c.header("X-Request-Id", c.get("requestId"));
  c.header("X-Response-Time", `${ms}ms`);
});

app.use("/api/*", cors({ origin: "http://localhost:5173" }));

app.get("/echo", (c) => c.json({ hello: c.req.query("name") ?? "stranger" }));
app.post("/echo", async (c) => {
  const body = await c.req.text();
  return c.json({ contentType: c.req.header("content-type"), youSent: body });
});
app.get("/time", (c) => {
  c.header("Cache-Control", "no-store");
  return c.json({ now: new Date().toISOString() });
});

// step 3: responses by hand
app.get("/api/status", (c) =>
  c.json({
    ok: true,
    requestId: c.get("requestId"),
    uptime: Math.round(process.uptime()),
  })
);
app.get("/hello", (c) =>
  c.html(`<h1>Hello, ${c.req.query("name") ?? "stranger"}!</h1>`)
);
app.get("/teapot", (c) => {
  c.header("X-Brewed-By", "Hono");
  return c.text("I'm a teapot\n", 418);
});
app.get("/home", (c) => c.redirect("/"));

// step 4: pages from strings
app.route("/strings", stringPages);

// step 5: pages from an engine
app.route("/eta", etaPages);

app.route("/api/entrances", entrancesApi);

// step 6: pages from components
app.get("/", (c) => {
  const name = c.req.query("name") ?? "stranger";
  return c.html(
    <Layout title="Home">
      <h1>Hello, {name}!</h1>
      <p>The office side of the building survey.</p>
    </Layout>
  );
});

app.get("/team", (c) =>
  c.html(
    <Layout title="Team">
      <h1>Team</h1>
      <ul>
        {team.map((member) => (
          <li>{member}</li>
        ))}
      </ul>
    </Layout>
  )
);

// step 7b: a page that lists a folder
app.get("/files", async (c) => {
  const names = await readdir("./public");
  const files = names.map((name) => ({
    name,
    size: Bun.file(`./public/${name}`).size,
  }));
  return c.html(
    <Layout title="Files">
      <h1>public/</h1>
      <ul>
        {files.map((file) => (
          <li>
            <a href={`/${file.name}`}>{file.name}</a> — {file.size} bytes
          </li>
        ))}
      </ul>
    </Layout>
  );
});

// go further - week 2

//first, the building we query the user for the number of floors,
//then we filter the list of buildings to only those with that many floors or more
app.get("/buildings", (c) => {
  const floorsParam = c.req.query("floors");
  let minFloors: number | undefined;

  if (floorsParam !== undefined) {
    // Validate integer-only format (prevents Number("") -> 0, "5abc", etc.)
    if (!Number.isInteger(Number(floorsParam)) || Number(floorsParam) < 0) {
      return c.text(
        "Invalid 'floors' parameter: must be a non-negative integer\n",
        400
      );
    }
    minFloors = Number.parseInt(floorsParam, 10);
  }

  // filter buildings based on the minFloors parameter
  const filteredBuildings =
    minFloors === undefined
      ? buildings
      : buildings.filter((b) => b.floors >= minFloors);

  // print the filtered list of buildings, or a message if none match
  return c.html(
    <Layout title="Buildings">
      <h1>Buildings</h1>
      <p>List of buildings to survey.</p>
      {floorsParam !== undefined && (
        <p>
          Filtering by minimum floors: <strong>{minFloors}</strong> (
          <a href="/buildings">Clear filter</a>)
        </p>
      )}
      <ul>
        {filteredBuildings.length > 0 ? (
          filteredBuildings.map((b) => (
            <li key={b.id}>
              <a href={`/buildings/${b.id}`}>{b.name}</a> — {b.floors} floors (
              {b.address})
            </li>
          ))
        ) : (
          <li>No buildings match the criteria.</li>
        )}
      </ul>
    </Layout>
  );
});

// the detailed view of a building, based on its id
app.get("/buildings/:id", (c) => {
  // validate that the id parameter is a positive integer
  const id = c.req.param("id");
  const building = buildings.find((b) => b.id.toString() === id);
  //returns 404 if the building is not found
  if (!building) {
    return c.notFound();
  }
  // returns the building details if found
  return c.html(
    <Layout title={building.address}>
      <h1>{building.name}</h1>
      <p>
        <strong>Address:</strong> {building.address}
      </p>
      <p>
        <strong>Floors:</strong> {building.floors}
      </p>
      <p>{building.description}</p>
    </Layout>
  );
});

// step 9: the about page (branch feat/about-page)
app.get("/about", (c) =>
  c.html(
    <Layout title="About">
      <h1>About</h1>
      <p>
        The office site plans building surveys, assigns them and reads what the
        field app sends back.
      </p>
    </Layout>
  )
);

// step 8: our own 404 and 500 pages
app.notFound((c) =>
  c.html(
    <Layout title="Not found">
      <h1>404 — nothing here</h1>
      <p>
        No page at <code>{c.req.path}</code>. <a href="/">Back home</a>
      </p>
    </Layout>,
    404
  )
);

app.onError((err, c) => {
  console.error(`[${c.get("requestId")}]`, err.message);
  return c.html(
    <Layout title="Error">
      <h1>Something broke</h1>
      <p>Request {c.get("requestId")} failed. It has been logged.</p>
    </Layout>,
    500
  );
});

app.get("/boom", () => {
  throw new Error("Boom: a test error");
});

export default {
  fetch: app.fetch,
  port: 3000,
};
