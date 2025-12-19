const watchPaths = ["./js", "./plugins", "./template", "./*.json", "./**/*.cjs", "./**/*.js"];

async function runTask(name: string) {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["task", name],
    stdout: "inherit",
    stderr: "inherit"
  });
  const res = await cmd.output();
  if (!res.success) throw new Error(`Task failed: ${name} (code ${res.code})`);
}

let running = false;
let pending = false;

async function buildOnce() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  try {
    await runTask("build");
    await runTask("copy");
    console.log(`[watch] ok @ ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    console.error("[watch] failed:", e);
  } finally {
    running = false;
    if (pending) {
      pending = false;
      await buildOnce();
    }
  }
}

if (import.meta.main) {
  await buildOnce();

  const watcher = Deno.watchFs(["js", "plugins", "template", "healthcheck"], { recursive: true });
  console.log("[watch] watching js/, plugins/, template/, healthcheck/ ...");

  let debounceTimer: number | undefined;

  for await (const _event of watcher) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      buildOnce();
    }, 100) as unknown as number;
  }
}
