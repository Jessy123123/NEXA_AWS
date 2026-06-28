# AWS-IQ Backend

FastAPI server that backs the `dashboard/` prototype — one router section per
agent in `.kiro/specs/aws-iq/design.md`.

## Run it

```bash
pip install -r requirements.txt      # from repo root
uvicorn backend.main:app --reload --port 8000   # from repo root
```

Open `dashboard/index.html` in a browser — it calls `http://localhost:8000/api/...`.
Open `http://localhost:8000/docs` for interactive API docs (try each agent endpoint directly).

## Agents → endpoints

| Agent | Endpoints | Data right now |
|---|---|---|
| Profile | `GET /api/profile`, `GET /api/orgchart` | `backend/data/employee.json`, `orgchart.json` |
| Setup | `GET /api/setup/steps`, `POST /api/setup/advance` | `backend/data/setup_steps.json` |
| Knowledge | `POST /api/knowledge/query`, `GET /api/faq` | Bedrock KB if `BEDROCK_KNOWLEDGE_BASE_ID` is set, else `kb_fallback.json` / `faq.json` |
| Communication | `GET /api/communications`, `POST /api/communications/{id}/retry` | `backend/data/communications.json` |
| Daily Task | `GET /api/tasks`, `PATCH /api/tasks/{id}`, `GET /api/incidents`, `GET /api/training` | `backend/data/tasks.json`, `incidents.json`, `training.json` |

`GET /api/overview` aggregates a summary across all five for the Overview page's cards.

## Wiring up the real Knowledge Base

1. Start LocalStack: `docker compose up -d` (needs `LOCALSTACK_AUTH_TOKEN` set — Bedrock Knowledge Bases require LocalStack **Pro**).
2. `localstack-init/03-create-bedrock-knowledge-base.sh` runs automatically and prints a `BEDROCK_KNOWLEDGE_BASE_ID` if it succeeds.
3. Copy `backend/.env.example` to `backend/.env`, paste that ID into `BEDROCK_KNOWLEDGE_BASE_ID`.
4. Restart `uvicorn`. The Knowledge Agent now calls `retrieve_and_generate` against your synced `dataset/*.md` files instead of the local fallback extract.

If step 2 fails (no LocalStack Pro, KB not synced yet), the Knowledge Agent silently falls back to `kb_fallback.json` — the dashboard chat keeps working, and answers are tagged with a "[local extract]" note so you know which mode you're in.

## Swapping mock JSON for real DynamoDB later

Each agent module (`backend/agents/*.py`) only talks to `backend/store.py`'s `load`/`save`. Swap those two functions for `boto3` DynamoDB calls against the tables already defined in `localstack-init/01-create-dynamodb-tables.sh` and the rest of the code doesn't change.
