"""
Shared Folder MCP Server
A simple MCP server that watches a local folder and exposes file tools.
Students can use this as a data source for their hackathon projects.

Usage:
    python mcp_folder_server.py --folder ./data-source/inbox

Tools exposed:
    - list_files() -> list all files in the watched folder
    - get_new_files(since) -> files modified after a caller-supplied timestamp (stateless)
    - get_new_files_since_last_check() -> files modified since the last call (server-side state, single cursor)
    - get_new_files_for_client(client_id) -> files modified since the client's last call (per-client state)
    - reset_last_check(client_id) -> reset stored cursor(s); pass "" to reset the shared cursor, or a client_id
    - read_file(filename) -> read contents of a specific file
    - file_info(filename) -> get metadata (size, modified date, type)
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path
from mcp.server.fastmcp import FastMCP

# Configuration
WATCH_FOLDER = os.environ.get("WATCH_FOLDER", "./data-source/inbox")

# Create MCP server
mcp = FastMCP("folder-watcher")

# In-memory state for "since last check" tools.
# Note: state is lost when the server restarts. For persistence, swap these
# dicts for a small JSON file or SQLite store.
_shared_last_check_ts: float = 0.0          # Option A: single shared cursor
_client_last_check_ts: dict[str, float] = {}  # Option B: per-client cursor


@mcp.tool()
def list_files() -> str:
    """List all files in the watched folder with their metadata."""
    folder = Path(WATCH_FOLDER)
    if not folder.exists():
        return json.dumps({"error": f"Folder {WATCH_FOLDER} does not exist"})

    files = []
    for f in sorted(folder.iterdir()):
        if f.is_file() and not f.name.startswith("."):
            stat = f.stat()
            files.append({
                "filename": f.name,
                "size_bytes": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "extension": f.suffix
            })

    return json.dumps({"folder": str(folder.resolve()), "file_count": len(files), "files": files}, indent=2)


@mcp.tool()
def get_new_files(since: str) -> str:
    """
    Get files modified after a given timestamp.
    
    Args:
        since: ISO format timestamp (e.g., '2026-06-16T10:00:00')
    """
    folder = Path(WATCH_FOLDER)
    if not folder.exists():
        return json.dumps({"error": f"Folder {WATCH_FOLDER} does not exist"})

    try:
        since_dt = datetime.fromisoformat(since)
        since_ts = since_dt.timestamp()
    except ValueError:
        return json.dumps({"error": f"Invalid timestamp format: {since}. Use ISO format like '2026-06-16T10:00:00'"})

    new_files = []
    for f in sorted(folder.iterdir()):
        if f.is_file() and not f.name.startswith("."):
            stat = f.stat()
            if stat.st_mtime > since_ts:
                new_files.append({
                    "filename": f.name,
                    "size_bytes": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "extension": f.suffix
                })

    return json.dumps({
        "since": since,
        "new_file_count": len(new_files),
        "files": new_files
    }, indent=2)


def _scan_new_files(since_ts: float) -> list[dict]:
    """Internal helper: return file metadata for files modified after since_ts."""
    folder = Path(WATCH_FOLDER)
    new_files = []
    for f in sorted(folder.iterdir()):
        if f.is_file() and not f.name.startswith("."):
            stat = f.stat()
            if stat.st_mtime > since_ts:
                new_files.append({
                    "filename": f.name,
                    "size_bytes": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "extension": f.suffix
                })
    return new_files


@mcp.tool()
def get_new_files_since_last_check() -> str:
    """
    Get files modified since the LAST call to this tool.

    Uses a single shared cursor stored on the server. Suitable when there is
    only one consumer/client. The cursor is advanced to "now" on every call.
    """
    global _shared_last_check_ts

    folder = Path(WATCH_FOLDER)
    if not folder.exists():
        return json.dumps({"error": f"Folder {WATCH_FOLDER} does not exist"})

    since_ts = _shared_last_check_ts
    now_ts = time.time()
    new_files = _scan_new_files(since_ts)
    _shared_last_check_ts = now_ts  # advance cursor

    return json.dumps({
        "since": datetime.fromtimestamp(since_ts).isoformat() if since_ts > 0 else None,
        "checked_at": datetime.fromtimestamp(now_ts).isoformat(),
        "new_file_count": len(new_files),
        "files": new_files
    }, indent=2)


@mcp.tool()
def get_new_files_for_client(client_id: str) -> str:
    """
    Get files modified since this CLIENT's last call.

    Maintains a separate cursor per client_id, so multiple consumers can
    poll independently without interfering with each other.

    Args:
        client_id: Any stable identifier for the caller (e.g., "agent-1").
    """
    folder = Path(WATCH_FOLDER)
    if not folder.exists():
        return json.dumps({"error": f"Folder {WATCH_FOLDER} does not exist"})

    if not client_id:
        return json.dumps({"error": "client_id must be a non-empty string"})

    since_ts = _client_last_check_ts.get(client_id, 0.0)
    now_ts = time.time()
    new_files = _scan_new_files(since_ts)
    _client_last_check_ts[client_id] = now_ts  # advance this client's cursor

    return json.dumps({
        "client_id": client_id,
        "since": datetime.fromtimestamp(since_ts).isoformat() if since_ts > 0 else None,
        "checked_at": datetime.fromtimestamp(now_ts).isoformat(),
        "new_file_count": len(new_files),
        "files": new_files
    }, indent=2)


@mcp.tool()
def reset_last_check(client_id: str = "") -> str:
    """
    Reset stored cursors so the next "since last check" call returns all files.

    Args:
        client_id: Pass "" (empty) to reset the shared cursor used by
                   get_new_files_since_last_check. Pass a specific client_id
                   to reset only that client's cursor. Pass "*" to reset all
                   client cursors.
    """
    global _shared_last_check_ts

    if client_id == "":
        _shared_last_check_ts = 0.0
        return json.dumps({"reset": "shared", "ok": True})
    if client_id == "*":
        count = len(_client_last_check_ts)
        _client_last_check_ts.clear()
        return json.dumps({"reset": "all_clients", "cleared_count": count, "ok": True})
    if client_id in _client_last_check_ts:
        del _client_last_check_ts[client_id]
        return json.dumps({"reset": client_id, "ok": True})
    return json.dumps({"reset": client_id, "ok": True, "note": "client_id had no stored cursor"})


@mcp.tool()
def read_file(filename: str) -> str:
    """
    Read the contents of a file in the watched folder.
    
    Args:
        filename: Name of the file to read (not full path)
    """
    folder = Path(WATCH_FOLDER)
    filepath = folder / filename

    if not filepath.exists():
        return json.dumps({"error": f"File '{filename}' not found in {WATCH_FOLDER}"})

    if not filepath.is_file():
        return json.dumps({"error": f"'{filename}' is not a file"})

    # Safety: don't read files larger than 1MB
    if filepath.stat().st_size > 1_000_000:
        return json.dumps({"error": f"File '{filename}' is too large (>1MB). Skipping."})

    try:
        content = filepath.read_text(encoding="utf-8")
        return json.dumps({
            "filename": filename,
            "size_bytes": len(content),
            "content": content
        }, indent=2)
    except UnicodeDecodeError:
        return json.dumps({"error": f"File '{filename}' is binary and cannot be read as text."})


@mcp.tool()
def file_info(filename: str) -> str:
    """
    Get metadata about a specific file.
    
    Args:
        filename: Name of the file
    """
    folder = Path(WATCH_FOLDER)
    filepath = folder / filename

    if not filepath.exists():
        return json.dumps({"error": f"File '{filename}' not found in {WATCH_FOLDER}"})

    stat = filepath.stat()
    return json.dumps({
        "filename": filename,
        "full_path": str(filepath.resolve()),
        "size_bytes": stat.st_size,
        "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "extension": filepath.suffix,
        "is_text": filepath.suffix in [".txt", ".md", ".json", ".csv", ".py", ".js", ".html", ".xml", ".yaml", ".yml", ".log"]
    }, indent=2)


if __name__ == "__main__":
    # Ensure the watch folder exists
    os.makedirs(WATCH_FOLDER, exist_ok=True)
    print(f"Folder Watcher MCP Server")
    print(f"Watching: {os.path.abspath(WATCH_FOLDER)}")
    print(f"Starting MCP server...")
    mcp.run(transport="stdio")
