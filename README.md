# GenAI Hackathon — Starter Kit

## What's Inside

```
├── .kiro/
│   ├── settings/mcp.json              ← MCP server config (auto-detected by Kiro)
│   └── skills/etl-pipeline/           ← ETL skill (activates with "process my inbox")
│       ├── SKILL.md                   ← Instructions
│       ├── references/                ← Output templates
│       └── scripts/                   ← Validation script
├── mcp-servers/
│   └── folder_watcher.py             ← Shared Folder MCP server
├── data-source/
│   └── inbox/                         ← Drop files here for the agent to process
├── dataset/                           ← Sample data files to explore
├── requirements.txt                   ← Python dependencies
├── SETUP-GUIDE.md                     ← Detailed setup instructions
└── README.md                          ← This file
```

## Quick Start

```bash
# 1. Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate       # Mac/Linux
# .venv\Scripts\activate        # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Open in Kiro
kiro .
```

## How It Works

1. **Drop files** into `data-source/inbox/` — these are your "incoming data"
2. **Ask Kiro** to process them — e.g., "What files are in my inbox?" or "Process my inbox files"
3. **Kiro uses the MCP** (folder-watcher) to read the files
4. **Kiro activates the ETL skill** to classify, extract entities, and generate output
5. **Output** appears in `output/` — structured JSON, HTML report, growing knowledge log

## The 5-Step Framework

| Step | What | How |
|------|------|-----|
| 1. Connect | Link to data sources | MCP server (we built one — you can add more) |
| 2. Generate | Create test data | Ask Kiro to generate mock files |
| 3. Transform | Classify & extract | ETL skill does this automatically |
| 4. Output | Make it visible | HTML reports, JSON, Mermaid diagrams |
| 5. Act | Automate next steps | Send email, post alert, update DB |

## Creating Your Own MCP Servers

The folder-watcher MCP is just a starting point. Add more servers to `mcp-servers/`:
- S3 buckets
- Local databases (SQLite, MySQL)
- REST APIs
- RSS feeds
- Any data source you can imagine

Pattern: expose `list_items()`, `get_item(id)`, `get_new_items(since)` as MCP tools.

Register new servers in `.kiro/settings/mcp.json`.

## Creating Your Own Skills

Skills live in `.kiro/skills/<skill-name>/SKILL.md`. Create one for your specific pipeline:

```
.kiro/skills/my-skill/
├── SKILL.md          ← When to activate + step-by-step instructions
├── references/       ← Templates, schemas, examples
└── scripts/          ← Validation, generation, API calls
```

## Persisting Knowledge (Compounding Effect)

After your ETL runs, persist output to Kiro's knowledge base:

```
/knowledge add --name "my-intel" --path ./output/knowledge.jsonl --index-type Best
```

Next session, Kiro automatically searches this — giving richer answers as data accumulates.

## Windows Note

In `.kiro/settings/mcp.json`, the command path uses Unix format:
```json
"command": ".venv/bin/python"
```

On Windows, change to:
```json
"command": ".venv\\Scripts\\python"
```
