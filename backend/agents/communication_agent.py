"""Communication Agent — notification log + retry (design.md §Communication Agent).

Retry strategy mirrors design.md: exponential backoff, max 3 attempts, then
the message would move to a dead-letter queue. This in-memory version just
flips status so the dashboard's "Retry" button has something real to call.
"""

from fastapi import HTTPException

from .. import store

FILENAME = "communications.json"
MAX_RETRIES = 3


def get_communications() -> list:
    return store.load(FILENAME)


def retry(comm_id: str) -> dict:
    comms = store.load(FILENAME)
    for comm in comms:
        if comm["id"] == comm_id:
            if comm["status"] != "Retrying":
                raise HTTPException(status_code=400, detail="Only 'Retrying' messages can be retried")
            comm["retryCount"] = comm.get("retryCount", 0) + 1
            comm["status"] = "Sent" if comm["retryCount"] <= MAX_RETRIES else "Failed"
            store.save(FILENAME, comms)
            return comm
    raise HTTPException(status_code=404, detail=f"Communication '{comm_id}' not found")
