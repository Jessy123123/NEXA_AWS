# Output Templates Reference

## HTML Report Template

Use this structure for `output/report.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>ETL Pipeline Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #232F3E; border-bottom: 3px solid #FF9900; padding-bottom: 8px; }
    h2 { color: #232F3E; margin-top: 32px; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 24px; }
    .card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 12px 0; border-left: 4px solid #FF9900; }
    .card h3 { margin: 0 0 8px 0; color: #232F3E; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #232F3E; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f5f5f5; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
    .badge-meeting { background: #dbeafe; color: #1e40af; }
    .badge-document { background: #dcfce7; color: #166534; }
    .badge-communication { background: #fef3c7; color: #92400e; }
    .badge-data { background: #f3e8ff; color: #6b21a8; }
    .priority-high { color: #dc2626; font-weight: bold; }
    .priority-medium { color: #d97706; }
    .priority-low { color: #059669; }
  </style>
</head>
<body>
  <h1>📊 ETL Pipeline Report</h1>
  <div class="meta">
    Processed: {timestamp} | Files: {file_count} | Entities: {entity_count}
  </div>

  <h2>📁 Files Processed</h2>
  <!-- One card per file with classification badge -->

  <h2>👥 People Identified</h2>
  <!-- Table: Name | Role | Mentioned In -->

  <h2>✅ Action Items</h2>
  <!-- Table: Owner | Task | Deadline | Source | Priority -->

  <h2>📋 Decisions</h2>
  <!-- Table: Decision | Made By | Date | Source -->

  <h2>🏷️ Topics</h2>
  <!-- Tag cloud or list -->

  <h2>🔗 Connections</h2>
  <!-- Cross-file references and relationships -->
</body>
</html>
```

## Incremental Knowledge Pattern

Each run appends to `knowledge.jsonl`. Over time, this builds a searchable knowledge base:

- Run 1: 3 files → 10 entities
- Run 2: +2 files → 15 entities (5 new)
- Run 3: +1 file → 18 entities (3 new, 2 linked to existing)

The agent can query `knowledge.jsonl` to find related entities across processing runs,
demonstrating the "compounding intelligence" concept.
