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
  // Like `cpx './dist/*' dest` (contents only, not the parent folder)
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

if (import.meta.main) {
  const root = Deno.args[0] ?? "./corescript";

  await copyDir("template", root);
  await copyDirContents("dist", join(root, "js"));
  await copyDir("js/libs", join(root, "js", "libs"));
  await copyDir("plugins", join(root, "js", "plugins"));
}
