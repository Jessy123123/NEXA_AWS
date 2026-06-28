"""Communication Agent — notification log + retry (design.md §Communication Agent).

Retry strategy mirrors design.md: exponential backoff, max 3 attempts, then
the message would move to a dead-letter queue. This in-memory version just
flips status so both the dashboard's "Retry" button and the Orchestrator
Agent's chat have something real to call.
"""

from fastapi import HTTPException

from .. import store

FILENAME = "communications.json"
MAX_RETRIES = 3


def get_communications(employee_id: str) -> list:
    data = store.load(FILENAME)
    if employee_id not in data:
        raise HTTPException(status_code=404, detail=f"No communication log for '{employee_id}'")
    return data[employee_id]


def retry(employee_id: str, comm_id: str) -> dict:
    data = store.load(FILENAME)
    comms = data.get(employee_id, [])
    for comm in comms:
        if comm["id"] == comm_id:
            if comm["status"] != "Retrying":
                raise HTTPException(status_code=400, detail="Only 'Retrying' messages can be retried")
            comm["retryCount"] = comm.get("retryCount", 0) + 1
            comm["status"] = "Sent" if comm["retryCount"] <= MAX_RETRIES else "Failed"
            store.save(FILENAME, data)
            return comm
    raise HTTPException(status_code=404, detail=f"Communication '{comm_id}' not found for '{employee_id}'")


def find_retrying(employee_id: str) -> dict | None:
    """Used by the Orchestrator Agent for 'resend that failed email' style requests."""
    return next((c for c in get_communications(employee_id) if c["status"] == "Retrying"), None)
