// Try system "zip". If not found, warn and continue successfully.
// Usage: deno run -A scripts/zip.ts <out.zip> <folder>

function usage(): never {
  console.error("Usage: deno run -A scripts/zip.ts <out.zip> <folder>");
  Deno.exit(1);
}

async function folderExists(path: string): Promise<boolean> {
  try {
    const st = await Deno.stat(path);
    return st.isDirectory;
  } catch {
    return false;
  }
}

async function tryRun(cmd: string, args: string[]): Promise<{ ok: boolean; code?: number; reason?: string }> {
  try {
    const p = new Deno.Command(cmd, { args, stdout: "inherit", stderr: "inherit" });
    const res = await p.output();
    return { ok: res.success, code: res.code };
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "spawn_failed" };
  }
}

if (import.meta.main) {
  const outZip = Deno.args[0];
  const folder = Deno.args[1];
  if (!outZip || !folder) usage();

  if (!(await folderExists(folder))) {
    console.warn(`[zip] folder not found: "${folder}" — skipping zip (continuing)`);
    Deno.exit(0);
  }

  // 1) Try "zip" (common on linux/mac; sometimes via msys/git-bash)
  {
    const r = await tryRun("zip", ["-r", outZip, folder]);
    if (r.ok) {
      console.log(`[zip] wrote ${outZip} (via zip)`);
      Deno.exit(0);
    }
    if (r.reason !== "not_found") {
      console.warn(`[zip] "zip" failed (code ${r.code ?? "?"}) — will try 7z next`);
    }
  }

  // 2) Try "7z" (7-Zip). Creates a real .zip.
  // Command: 7z a -tzip out.zip .\folder
  {
    const r = await tryRun("7z", ["a", "-tzip", outZip, folder]);
    if (r.ok) {
      console.log(`[zip] wrote ${outZip} (via 7z)`);
      Deno.exit(0);
    }
    if (r.reason !== "not_found") {
      console.warn(`[zip] "7z" failed (code ${r.code ?? "?"})`);
    }
  }

  // 3) gzip note
  console.warn(
    `[zip] no usable zip tool found ("zip" or "7z"). `
  );
  Deno.exit(0);
}
