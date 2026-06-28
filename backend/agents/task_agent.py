"""Daily Task Agent — tasks, incidents, training (design.md §Daily Task Agent)."""

import re

from fastapi import HTTPException

from .. import store

_STOPWORDS = {"the", "task", "as", "a", "an", "for", "to", "my", "this", "that", "is", "mark", "complete", "finish", "done"}


def _for_employee(filename: str, employee_id: str) -> list:
    data = store.load(filename)
    if employee_id not in data:
        raise HTTPException(status_code=404, detail=f"No '{filename}' records for '{employee_id}'")
    return data[employee_id]


def get_tasks(employee_id: str) -> list:
    return _for_employee("tasks.json", employee_id)


def get_incidents(employee_id: str) -> list:
    return _for_employee("incidents.json", employee_id)


def get_training(employee_id: str) -> list:
    return _for_employee("training.json", employee_id)


def set_task_done(employee_id: str, task_id: str, done: bool) -> dict:
    data = store.load("tasks.json")
    tasks = data.get(employee_id, [])
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = done
            store.save("tasks.json", data)
            return task
    raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found for '{employee_id}'")


def find_task_by_keyword(employee_id: str, keyword: str) -> dict | None:
    """Fuzzy lookup used by the Orchestrator Agent (e.g. 'mark the VPN task done').

    Scores tasks by significant-word overlap rather than requiring an exact
    substring match, since chat phrasing rarely matches the task label verbatim.
    """
    words = {w for w in re.findall(r"[a-z0-9]+", keyword.lower()) if w not in _STOPWORDS}
    if not words:
        return None
    best, best_score = None, 0
    for task in get_tasks(employee_id):
        label_words = set(re.findall(r"[a-z0-9]+", task["label"].lower()))
        score = len(words & label_words)
        if score > best_score:
            best, best_score = task, score
    return best
