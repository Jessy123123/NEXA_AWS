"""Profile Agent — employee profile + organizational chart (design.md §Profile Agent)."""

from .. import store


def get_employee() -> dict:
    return store.load("employee.json")


def get_orgchart() -> list:
    return store.load("orgchart.json")
