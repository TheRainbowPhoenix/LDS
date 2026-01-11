#!/usr/bin/env python3
import argparse
import os
import re
from pathlib import Path

# Map file extensions to Markdown code fence languages
EXT_TO_LANG = {
    ".py": "python",
    ".ipynb": "json",
    ".js": "javascript",
    ".jsx": "jsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".java": "java",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".rb": "ruby",
    ".php": "php",
    ".go": "go",
    ".rs": "rust",
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".hpp": "cpp",
    ".cs": "csharp",
    ".swift": "swift",
    ".m": "objectivec",
    ".mm": "objectivecpp",
    ".sql": "sql",
    ".sh": "bash",
    ".bash": "bash",
    ".ps1": "powershell",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".md": "markdown",
    ".markdown": "markdown",
    ".json": "json",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".toml": "toml",
    ".ini": "ini",
    ".cfg": "ini",
    ".xml": "xml",
    ".txt": "",
    ".env": "",
    ".dockerfile": "dockerfile",
    "Dockerfile": "dockerfile",  # special case if name is exactly Dockerfile
}

DEFAULT_IGNORED_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "__pycache__", ".venv", "venv",
    ".idea", ".vscode", "dist", "build", "target", ".next", ".turbo",
    ".DS_Store"
}

def looks_binary(sample: bytes) -> bool:
    # Heuristic: null bytes or a high fraction of non-texty bytes
    if b"\x00" in sample:
        return True
    # Count control chars excluding \n, \r, \t, \f, \b
    texty = b"\n\r\t\f\b"
    control = sum(1 for b in sample if (b < 32 and b not in texty))
    return (control / max(1, len(sample))) > 0.30

def best_fence_for(content: str) -> str:
    # Use a fence with one more backtick than the longest run in the content
    longest = 0
    run = 0
    for ch in content:
        if ch == "`":
            run += 1
            if run > longest:
                longest = run
        else:
            run = 0
    return "`" * max(3, longest + 1)

def lang_for(path: Path) -> str:
    name = path.name
    if name == "Dockerfile":
        return "dockerfile"
    ext = path.suffix.lower()
    return EXT_TO_LANG.get(ext, "")

def should_skip(path: Path, ignore_globs):
    for pat in ignore_globs:
        if path.match(pat):
            return True
    return False

def iter_files(root: Path, ignore_globs, follow_symlinks=False):
    for dirpath, dirnames, filenames in os.walk(root, followlinks=follow_symlinks):
        # Prune ignored directories in-place for efficiency
        pruned = []
        for d in dirnames:
            p = Path(dirpath) / d
            if d in DEFAULT_IGNORED_DIRS or should_skip(p, ignore_globs):
                pruned.append(d)
        for d in pruned:
            dirnames.remove(d)

        for fn in filenames:
            p = Path(dirpath) / fn
            if should_skip(p, ignore_globs):
                continue
            yield p

def strip_token_comments(content: str) -> str:
    """
    Remove lines that match: optional whitespace + '// Token:'
    Common in decompiled C# code.
    """
    token_line_pattern = re.compile(r"^\s*//\s*Token:", re.MULTILINE)
    # Split lines while preserving line endings
    lines = content.splitlines(keepends=True)
    filtered_lines = [line for line in lines if not token_line_pattern.match(line)]
    return "".join(filtered_lines)

def main():
    ap = argparse.ArgumentParser(
        description="Embed a folder's files into a single Markdown file for LLM consumption."
    )
    ap.add_argument("folder", type=Path, help="Folder to embed")
    ap.add_argument(
        "--out",
        type=Path,
        help="Output Markdown file path (default: <foldername>.md beside the folder)"
    )
    ap.add_argument(
        "--ignore",
        action="append",
        default=[],
        help="Glob to ignore (repeatable). Example: --ignore '*/.cache/*' --ignore '*.lock'"
    )
    ap.add_argument(
        "--max-bytes",
        type=int,
        default=None,
        help="Skip files larger than this many bytes"
    )
    ap.add_argument(
        "--follow-symlinks",
        action="store_true",
        help="Follow symlinks while walking"
    )
    ap.add_argument(
        "--include-binary",
        action="store_true",
        help="Include binary files as base64 blocks (otherwise they are skipped)"
    )
    ap.add_argument(
        "--sort",
        choices=["path", "ext", "size"],
        default="path",
        help="Sort files in the output (default: path)"
    )

    args = ap.parse_args()
    root = args.folder.resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Not a directory: {root}")

    out_path = args.out
    if out_path is None:
        out_path = root.with_name(root.name + ".md")

    files = list(iter_files(root, args.ignore, follow_symlinks=args.follow_symlinks))

    # Optional sort
    if args.sort == "path":
        files.sort(key=lambda p: str(p.relative_to(root)).lower())
    elif args.sort == "ext":
        files.sort(key=lambda p: (p.suffix.lower(), str(p.relative_to(root)).lower()))
    elif args.sort == "size":
        files.sort(key=lambda p: (p.stat().st_size, str(p.relative_to(root)).lower()))

    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        # Optional: brief header
        out.write(f"# Embedded folder: {root.name}\n\n")

        for f in files:
            try:
                if args.max_bytes is not None and f.stat().st_size > args.max_bytes:
                    rel = f.relative_to(root).as_posix()
                    out.write(f"`{rel}`:\n\n*Skipped (>{args.max_bytes} bytes).* \n\n")
                    continue

                # Peek to detect binary
                with f.open("rb") as fh:
                    sample = fh.read(4096)
                is_bin = looks_binary(sample)

                rel = f.relative_to(root).as_posix()

                if is_bin and not args.include_binary:
                    out.write(f"`{rel}`:\n\n*Skipped (binary file).* \n\n")
                    continue

                if is_bin and args.include_binary:
                    import base64
                    data = Path(f).read_bytes()
                    b64 = base64.b64encode(data).decode("ascii")
                    fence = best_fence_for(b64)
                    out.write(f"`{rel}`:\n{fence}\n{b64}\n{fence}\n\n")
                    continue

                # Read as text with UTF-8; replace errors to avoid crashes
                content = f.read_text(encoding="utf-8", errors="replace")
                # Remove // Token: ... lines (common in decompiled C#)
                content = strip_token_comments(content)
                fence = best_fence_for(content)
                lang = lang_for(f)

                # Section
                out.write(f"`{rel}`:\n")
                if lang:
                    out.write(f"{fence}{lang}\n")
                else:
                    out.write(f"{fence}\n")
                out.write(content)
                # Ensure trailing newline before closing fence
                if not content.endswith("\n"):
                    out.write("\n")
                out.write(f"{fence}\n\n")

            except Exception as e:
                rel = f.relative_to(root).as_posix()
                out.write(f"`{rel}`:\n\n*Skipped (error: {e}).*\n\n")

    print(f"Wrote {out_path}")

if __name__ == "__main__":
    main()