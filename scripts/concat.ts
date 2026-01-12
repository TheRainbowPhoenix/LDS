import { ensureDir } from "@std/fs";
import { join } from "@std/path";

type Order = string[];

function usage(): never {
  console.error("Usage: deno run -A scripts/concat.ts <name> [--sourcemap]");
  Deno.exit(1);
}

function looksTruthy(s: string | undefined): boolean {
  if (!s) return false;
  return ["1", "true", "yes", "y", "on"].includes(s.toLowerCase());
}

/**
 * Minimal sourcemap: valid JSON + sourcesContent, but mappings are empty.
 * (Good enough for tooling that just wants a map file present; not line-accurate.)
 */
function makeStubSourceMap(outFileName: string, sources: string[], sourcesContent: string[]) {
  return {
    version: 3,
    file: outFileName,
    sources,
    sourcesContent,
    names: [],
    mappings: ""
  };
}

const SEPARATOR = '\n//-----------------------------------------------------------------------------\n'

export async function concatSource(name: string, sourceMap: boolean) {
  const orderPath = join(Deno.cwd(), `${name}.json`);
  const orderText = await Deno.readTextFile(orderPath);
  const order = JSON.parse(orderText) as Order;

  const pieces: string[] = [];
  const sources: string[] = [];
  const sourcesContent: string[] = [];

  for (const fileName of order) {
    const path = join(Deno.cwd(), fileName);
    const content = await Deno.readTextFile(path);
    pieces.push(content);
    pieces.push(SEPARATOR)
    if (sourceMap) {
      sources.push(fileName);
      sourcesContent.push(content);
    }
  }

  const outFolder = join(Deno.cwd(), "dist");
  await ensureDir(outFolder);

  const outFileName = `${name}.js`;
  const outPath = join(outFolder, outFileName);

  // Keep the same behavior as your old script: join with newline separators.
  const joined = pieces.join("\n");
  await Deno.writeTextFile(outPath, joined);

  if (sourceMap) {
    const map = makeStubSourceMap(outFileName, sources, sourcesContent);
    await Deno.writeTextFile(`${outPath}.map`, JSON.stringify(map, null, 2));
  }
}

if (import.meta.main) {
  const name = Deno.args[0];
  if (!name) usage();

  const sourceMap =
    Deno.args.includes("--sourcemap") ||
    looksTruthy(Deno.args[1]); // supports old positional truthy arg too

  await concatSource(name, sourceMap);
}
