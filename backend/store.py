import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


def load(filename: str):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def save(filename: str, data) -> None:
    with open(DATA_DIR / filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
