# office

The office side of the building survey: a Bun workspace.

<<<<<<< HEAD
- `apps/server` — Hono: the pages from lab 2 and `/api/entrances`
- `apps/web` — React + Vite: the entrance list and its form
- `packages/shared` — `@office/shared`: the zod schema and the types both sides use
=======
- `apps/server` — Hono: the pages from lab 2, `/api/buildings` and `/api/entrances`, the data in SQLite (`bun:sqlite`)
- `apps/web` — React + Vite: the entrance list and its form
- `packages/shared` — `@office/shared`: the zod schemas and the types both sides use
>>>>>>> 8d86a32b9eca365c371e9e2716a4ba87c9c16322

## Run it

```bash
bun install          # once, from the root: every workspace, one bun.lock
<<<<<<< HEAD
bun run dev:server   # http://localhost:3000
bun run dev:web      # http://localhost:5173 (a second terminal)
bun run check        # Ultracite (Biome): format + lint
```
=======
bun run migrate      # creates apps/server/data/office.sqlite; applies new migrations
bun run seed         # dev only: empties the tables and fills them with example rows
bun run dev:server   # http://localhost:3000
bun run dev:web      # http://localhost:5173 (a second terminal)
bun run check        # Ultracite (Biome): format + lint
```

## The database

- `apps/server/migrations/NNN-*.sql` — the schema, one numbered file per change; never edit one that has run, add the next
- `apps/server/src/db/` — the repository: every SQL statement, with `?` parameters
- `apps/server/data/` — the database file, git-ignored
>>>>>>> 8d86a32b9eca365c371e9e2716a4ba87c9c16322
