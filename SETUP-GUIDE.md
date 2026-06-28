# Setup Guide

Complete these steps to get your environment ready.

## Prerequisites

- **Python 3.10+** — [Download here](https://www.python.org/downloads/)
- **AWS Kiro** — [Download here](https://kiro.dev/downloads/)
- **Git** — [Download here](https://git-scm.com/)

## Step 1: Clone the Template

```bash
git clone <repo-url> my-project
cd my-project
```

## Step 2: Create Virtual Environment

```bash
# Create venv
python -m venv .venv

# Activate it
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

> **Why venv?** It isolates your project's dependencies so they don't conflict with other Python projects on your machine. Always use one.

## Step 3: Configure MCP for Your OS

Rename the correct MCP config file for your operating system:

**Mac/Linux:**
```bash
cp .kiro/settings/mcp-linux.json .kiro/settings/mcp.json
```

**Windows (PowerShell):**
```powershell
Copy-Item .kiro\settings\mcp-windows.json .kiro\settings\mcp.json
```

## Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 5: Open in Kiro

```bash
kiro .
```

Kiro will detect the `.kiro/settings/mcp.json` config and register the folder-watcher MCP server automatically.

## Step 6: Test the MCP Connection

1. Copy any file from `dataset/` into `data-source/inbox/`
2. In Kiro, ask: *"What files are in my inbox?"*
3. Kiro should respond with the file listing from the MCP server

## Step 7: Run the ETL Skill

1. With a file in `data-source/inbox/`, ask Kiro: *"Process my inbox files"*
2. Kiro activates the `/etl-pipeline` skill
3. Check the `output/` folder for structured results

If this works, you're ready to build!

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `python: command not found` | Try `python3` instead, or install Python from python.org |
| `pip install` fails | Make sure your venv is activated (you should see `(.venv)` in your terminal) |
| MCP server doesn't start | Check Python version: `python --version` (need 3.10+) |
| Kiro doesn't see the MCP | Make sure `.kiro/settings/mcp.json` exists in your project root |
| Windows: MCP path error | Change `.venv/bin/python` to `.venv\Scripts\python` in mcp.json |

---

## What to Build

Use the 5-step framework:

1. **Connect** — Add more MCP data sources (databases, APIs, email)
2. **Generate** — Ask Kiro to create mock/test data
3. **Transform** — Build skills that classify and extract from your data
4. **Output** — Create visual reports (HTML, Mermaid, dashboards)
5. **Act** — Automate actions (send email, post alert, call API)
