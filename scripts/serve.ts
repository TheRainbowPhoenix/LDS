import { serveDir } from "@std/http/file-server";
import { join } from "@std/path";

if (import.meta.main) {
  const root = Deno.args[0] ?? "./game";
  const port = Number(Deno.args[1] ?? "8080");

  console.log(`Serving ${root} on http://localhost:${port}`);
  Deno.serve({ port }, (req) => serveDir(req, { fsRoot: join(Deno.cwd(), root) }));
}
