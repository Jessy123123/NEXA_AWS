"""Profile Agent — employee profile + organizational chart (design.md §Profile Agent).

The org chart is built dynamically: a fixed per-department chart
(orgchart_base.json — VP, manager, peers, lifted from dataset/README.md's real
personnel) plus the looked-up employee inserted as the "me" node.
"""

from fastapi import HTTPException

from .. import store


def list_employees() -> list:
    """Used by the landing page's ID lookup and the orchestrator's identity check."""
    return store.load("employees.json")


def get_employee(employee_id: str) -> dict:
    employees = store.load("employees.json")
    employee = next((e for e in employees if e["employeeId"] == employee_id), None)
    if employee is None:
        raise HTTPException(status_code=404, detail=f"No employee found with ID '{employee_id}'")
    return employee


def get_orgchart(employee_id: str) -> list:
    employee = get_employee(employee_id)
    base = store.load("orgchart_base.json")
    chart = list(base.get(employee["department"], []))
    chart.append(
        {
            "id": "me",
            "name": employee["name"],
            "role": f"{employee['title']} (You)",
            "email": employee["email"],
            "teams": employee["teams"],
            "me": True,
        }
    )
    return chart
