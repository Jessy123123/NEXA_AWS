"""Setup Agent — IT provisioning workflow (design.md §Setup Agent).

Steps are role-specific: every employee gets the common VPN/Email/SharePoint/SSO
rollout from Employee-Onboarding-Checklist.md §2.2, plus one extra step from the
§2.3 role-specific access table (Engineering vs Finance, etc.).
"""

from fastapi import HTTPException

from .. import store

FILENAME = "setup_steps.json"


def get_steps(employee_id: str) -> list:
    all_steps = store.load(FILENAME)
    if employee_id not in all_steps:
        raise HTTPException(status_code=404, detail=f"No setup workflow found for '{employee_id}'")
    return all_steps[employee_id]


def advance_active_step(employee_id: str) -> list:
    """Mark the current 'active' step done and promote the next 'pending' step to active."""
    all_steps = store.load(FILENAME)
    if employee_id not in all_steps:
        raise HTTPException(status_code=404, detail=f"No setup workflow found for '{employee_id}'")
    steps = all_steps[employee_id]
    promoted_next = False
    for step in steps:
        if step["status"] == "active":
            step["status"] = "done"
        elif step["status"] == "pending" and not promoted_next:
            step["status"] = "active"
            promoted_next = True
    store.save(FILENAME, all_steps)
    return steps
