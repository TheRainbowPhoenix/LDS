import { ensureDir, walk } from "@std/fs";
import { join, relative } from "@std/path";

async function copyDir(srcDir: string, dstDir: string) {
  await ensureDir(dstDir);
  for await (const entry of walk(srcDir, { includeDirs: false })) {
    const rel = relative(srcDir, entry.path);
    const outPath = join(dstDir, rel);
    await ensureDir(join(outPath, ".."));
    await Deno.copyFile(entry.path, outPath);
  }
}

async function copyDirContents(srcDir: string, dstDir: string) {
  await ensureDir(dstDir);
  for await (const entry of Deno.readDir(srcDir)) {
    const srcPath = join(srcDir, entry.name);
    const dstPath = join(dstDir, entry.name);
    if (entry.isDirectory) {
      await copyDir(srcPath, dstPath);
    } else if (entry.isFile) {
      await Deno.copyFile(srcPath, dstPath);
    }
  }
}

async function dirExists(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isDirectory;
  } catch {
    return false;
  }
}


if (import.meta.main) {
  const mode = Deno.args[0];
  if (!mode) {
    console.error(
      "Usage: deno run -A scripts/copy.ts <corescripts|libs|main|plugins|template>"
    );
    Deno.exit(1);
  }

  switch (mode) {
    case "corescripts":
      // cpx './dist/*.js' ./game/js/
      await ensureDir(join("game", "js"));
      for await (const entry of Deno.readDir("dist")) {
        if (entry.isFile && entry.name.endsWith(".js")) {
          await Deno.copyFile(
            join("dist", entry.name),
            join("game", "js", entry.name)
          );
        }
      }
      break;

    case "libs":
      // cpx './js/libs/*.{js,wasm}' ./game/js/libs/
      await ensureDir(join("game", "js", "libs"));
      for await (const entry of Deno.readDir(join("js", "libs"))) {
        if (
          entry.isFile &&
          (entry.name.endsWith(".js") || entry.name.endsWith(".wasm"))
        ) {
          await Deno.copyFile(
            join("js", "libs", entry.name),
            join("game", "js", "libs", entry.name)
          );
        }
      }
      break;

    case "main":
      // cpx './js/main.js' ./game/js/
      await ensureDir(join("game", "js"));
      await Deno.copyFile(join("js", "main.js"), join("game", "js", "main.js"));
      break;

    case "plugins": {
      // cpx './plugins/*.js' ./game/js/plugins/
      const srcDir = "plugins";
      const dstDir = join("game", "js", "plugins");

      try {
        const stat = await Deno.stat(srcDir);
        if (!stat.isDirectory) break;
      } catch {
        // plugins/ doesn't exist -> nothing to copy
        console.warn("[copy:plugins] no plugins/ directory, skipping");
        break;
      }

      await ensureDir(dstDir);

      for await (const entry of Deno.readDir(srcDir)) {
        if (entry.isFile && entry.name.endsWith(".js")) {
          await Deno.copyFile(
            join(srcDir, entry.name),
            join(dstDir, entry.name)
          );
        }
      }
      break;
    }

    case "template":
      // cpx './template/**/*' ./game/
      await copyDir("template", "game");
      break;

    // convenience if you ever want these:
    case "dist-to-game-js":
      await copyDirContents("dist", join("game", "js"));
      break;

    default:
      console.error(`Unknown mode: ${mode}`);
      Deno.exit(1);
  }
}
