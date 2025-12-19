// Standard CRC-32 (IEEE 802.3), polynomial 0xEDB88320.
// Returns unsigned 32-bit integer (0..4294967295).

let table: Uint32Array | null = null;

function makeTable(): Uint32Array {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    t[i] = c >>> 0;
  }
  return t;
}

export function crc32Bytes(data: Uint8Array): number {
  if (!table) table = makeTable();

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    const b = data[i]!;
    crc = (table![(crc ^ b) & 0xFF]! ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// If you want string CRC like crc-32's bstr(), this treats the string as bytes 0..255.
// For normal UTF-8 JS files, using bytes from Deno.readFile is safer.
export function crc32Bstr(str: string): number {
  if (!table) table = makeTable();

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    const b = str.charCodeAt(i) & 0xFF;
    crc = (table![(crc ^ b) & 0xFF]! ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Convert unsigned -> signed int32 (matches many JS crc libs output style)
export function toInt32(n: number): number {
  return (n | 0);
}


const files = [
  "js/libs/fpsmeter.js",
  "js/libs/iphone-inline-video.browser.js",
  "js/libs/lz-string.js",
  "js/libs/pixi.js",
  "js/libs/pixi-picture.js",
  "js/libs/pixi-tilemap.js",
  "js/rpg_core.js",
  "js/rpg_managers.js",
  "js/rpg_objects.js",
  "js/rpg_scenes.js",
  "js/rpg_sprites.js",
  "js/rpg_windows.js",
];

async function ensureDir(path: string) {
  await Deno.mkdir(path, { recursive: true });
}

function toSignedInt32(n: number) {
  // Match the typical JS CRC32 libs that return signed 32-bit ints.
  return (n | 0);
}

if (import.meta.main) {
  const root = "corescript";

  const crc: Record<string, number> = {};

  for (const file of files) {
    const bytes = await Deno.readFile(`${root}/${file}`);
    const u32 = crc32Bytes(bytes);
    // Your old crc-32.bstr() yields signed int32s (often negative), keep compatibility:
    crc[file] = toInt32(u32);
  }

  const template = await Deno.readTextFile("healthcheck/Debug_HealthCheck.js");
  const plugin = template.replace("__CRC__", JSON.stringify(crc));

  await ensureDir(`${root}/js/plugins`);
  await Deno.writeTextFile(`${root}/js/plugins/Debug_HealthCheck.js`, plugin);

  console.log("[crc] wrote corescript/js/plugins/Debug_HealthCheck.js");
}
