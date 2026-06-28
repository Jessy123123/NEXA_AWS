---
name: etl-pipeline
description: Extract, transform, and load data from the shared folder MCP into structured output. Use when processing incoming files, classifying documents, extracting entities, or generating structured reports from raw data.
---

# ETL Pipeline Skill

You are an ETL (Extract, Transform, Load) agent that processes files from the shared folder data source, classifies their content, extracts structured information, and produces output files.

## Workflow

Follow these steps when the user asks to process, classify, or structure data from the inbox:

### Step 1: Extract — Read from Data Source

Use the folder-watcher MCP tools to discover and read new files:

1. Call `list_files()` or `get_new_files(since)` to find available files
2. Call `read_file(filename)` to get the content of each file
3. Identify the file format (markdown, CSV, JSON, plain text)

### Step 2: Transform — Classify & Structure

For each file, perform these transformations:

1. **Classify the document type:**
   - Meeting transcript → extract action items, decisions, owners
   - Business document → extract key policies, procedures, requirements
   - Communication (email/chat) → extract sender, intent, urgency, action needed
   - Data file (CSV/JSON) → identify schema, summarize contents

2. **Extract structured entities:**
   - People (names, roles, contact info)
   - Dates and deadlines
   - Decisions made
   - Action items (who, what, when)
   - Key metrics or numbers
   - Topics and categories

3. **Enrich with context:**
   - Link related items across documents
   - Flag conflicts or duplicates
   - Assign priority/urgency scores

### Step 3: Load — Write Structured Output

Produce output in the `./output/` folder:

1. **Summary JSON** — `output/summary.json`: structured data with all extracted entities
2. **Human-readable report** — `output/report.html`: formatted HTML report with findings
3. **Knowledge log** — `output/knowledge.jsonl`: append-only log of all processed items (for incremental growth)

### Output Formats

#### summary.json structure:
```json
{
  "processed_at": "ISO timestamp",
  "files_processed": ["filename1.md", "filename2.csv"],
  "entities": {
    "people": [{"name": "...", "role": "...", "mentioned_in": "..."}],
    "action_items": [{"owner": "...", "task": "...", "deadline": "...", "source": "..."}],
    "decisions": [{"decision": "...", "made_by": "...", "date": "...", "source": "..."}],
    "topics": ["topic1", "topic2"]
  },
  "classifications": [
    {"file": "...", "type": "meeting_transcript|document|communication|data", "confidence": 0.95}
  ]
}
```

#### report.html structure:
- Title with processing timestamp
- Summary section (files processed, entities found)
- Detailed findings per file
- Action items table (sorted by deadline)
- Knowledge graph connections (if multiple files reference same entities)

#### knowledge.jsonl format (one JSON object per line):
```json
{"timestamp": "...", "source_file": "...", "entity_type": "action_item", "data": {...}}
```

### Step 4: Validate

After generating output, run the validation script to ensure integrity:

Run `scripts/validate_output.py output/summary.json`

This checks that all required fields are present, entity types are valid, and classifications use expected document types.

### Step 5: Persist to Kiro Knowledge

After validation passes, add the output to Kiro's persistent knowledge base so future sessions can reference it:

1. Run `/knowledge add --name "etl-output" --path ./output/knowledge.jsonl --index-type Best`
2. On subsequent runs, update instead: `/knowledge update ./output/knowledge.jsonl`

This enables the compounding effect — Kiro will automatically search this knowledge base in future sessions, giving richer answers as more data accumulates.

## Rules

- Always read from the MCP data source, never ask the user to paste content
- Create the `output/` folder if it doesn't exist
- Append to `knowledge.jsonl` (never overwrite) — this enables incremental knowledge growth
- If a file cannot be classified, mark it as "unknown" with confidence 0.0
- Include the source filename in every extracted entity for traceability
- Generate the HTML report with inline CSS (no external dependencies)
