"""Daily Task Agent — tasks, incidents, training (design.md §Daily Task Agent)."""

from fastapi import HTTPException

from .. import store

TASKS_FILE = "tasks.json"


def get_tasks() -> list:
    return store.load(TASKS_FILE)


def get_incidents() -> list:
    return store.load("incidents.json")


def get_training() -> list:
    return store.load("training.json")


def set_task_done(task_id: str, done: bool) -> dict:
    tasks = store.load(TASKS_FILE)
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = done
            store.save(TASKS_FILE, tasks)
            return task
    raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
