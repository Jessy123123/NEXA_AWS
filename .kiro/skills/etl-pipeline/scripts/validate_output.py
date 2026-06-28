"""
Validate ETL output files.
Run after the ETL pipeline completes to check output integrity.

Usage:
    python scripts/validate_output.py output/summary.json
"""

import json
import sys
from pathlib import Path


def validate_summary(filepath: str) -> bool:
    """Validate summary.json has all required fields."""
    path = Path(filepath)
    
    if not path.exists():
        print(f"FAIL: {filepath} does not exist")
        return False
    
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"FAIL: {filepath} is not valid JSON - {e}")
        return False
    
    # Check required top-level fields
    required_fields = ['processed_at', 'files_processed', 'entities', 'classifications']
    missing = [f for f in required_fields if f not in data]
    if missing:
        print(f"FAIL: Missing required fields: {missing}")
        return False
    
    # Check entities structure
    entities = data.get('entities', {})
    entity_fields = ['people', 'action_items', 'decisions', 'topics']
    missing_entities = [f for f in entity_fields if f not in entities]
    if missing_entities:
        print(f"WARNING: Missing entity types: {missing_entities}")
    
    # Check classifications have required fields
    for i, cls in enumerate(data.get('classifications', [])):
        if 'file' not in cls:
            print(f"WARNING: Classification [{i}] missing 'file' field")
        if 'type' not in cls:
            print(f"WARNING: Classification [{i}] missing 'type' field")
        if cls.get('type') not in ['meeting_transcript', 'document', 'communication', 'data', 'unknown']:
            print(f"WARNING: Classification [{i}] has unexpected type: {cls.get('type')}")
    
    # Summary stats
    print(f"PASS: {filepath} is valid")
    print(f"  Files processed: {len(data.get('files_processed', []))}")
    print(f"  People found: {len(entities.get('people', []))}")
    print(f"  Action items: {len(entities.get('action_items', []))}")
    print(f"  Decisions: {len(entities.get('decisions', []))}")
    print(f"  Topics: {len(entities.get('topics', []))}")
    print(f"  Classifications: {len(data.get('classifications', []))}")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_output.py <path-to-summary.json>")
        print("  Default: output/summary.json")
        filepath = "output/summary.json"
    else:
        filepath = sys.argv[1]
    
    success = validate_summary(filepath)
    sys.exit(0 if success else 1)
