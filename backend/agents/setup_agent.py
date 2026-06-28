"""Setup Agent — IT provisioning workflow (design.md §Setup Agent).

Steps are ordered; only one is ever "active" at a time, mirroring the
sequential VPN -> Email -> SharePoint -> SSO -> Software rollout in
Employee-Onboarding-Checklist.md §2.2.
"""

from .. import store

FILENAME = "setup_steps.json"


def get_steps() -> list:
    return store.load(FILENAME)


def advance_active_step() -> list:
    """Mark the current 'active' step done and promote the next 'pending' step to active.

    Stands in for a provisioning Lambda completing and reporting status back
    (design.md §Setup Agent sequence diagram).
    """
    steps = store.load(FILENAME)
    promoted_next = False
    for step in steps:
        if step["status"] == "active":
            step["status"] = "done"
        elif step["status"] == "pending" and not promoted_next:
            step["status"] = "active"
            promoted_next = True
    store.save(FILENAME, steps)
    return steps
