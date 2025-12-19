import { ensureDir } from "@std/fs";
import { join } from "@std/path";

async function runConcat() {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "scripts/concat.ts", "rpg_mixer"],
    stdout: "inherit",
    stderr: "inherit"
  });
  const res = await cmd.output();
  if (!res.success) Deno.exit(res.code);
}

if (import.meta.main) {
  await runConcat();

  const src = join("dist", "rpg_mixer.js");
  const destDir = join("dist", "plugins");
  const dest = join(destDir, "rpg_mixer.js");

  await ensureDir(destDir);

  try {
    await Deno.stat(src);
  } catch {
    // Nothing to move.
    Deno.exit(0);
  }

  // Rename is atomic on same filesystem; fallback to copy+remove if needed.
  try {
    await Deno.rename(src, dest);
  } catch {
    await Deno.copyFile(src, dest);
    await Deno.remove(src);
  }
}
