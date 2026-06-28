"""Orchestrator Agent — single chat entry point that routes to the 5 specialists
(design.md §Orchestrator Agent / Multi-Agent Collaboration Architecture).

This is a deterministic keyword router, not an LLM function-calling agent —
there's no LLM wired in for intent classification yet. In the real
architecture this layer is exactly where a Bedrock Agent with action groups
per specialist (design.md §10.3) would replace the if/elif chain below with
actual tool-calling. The routing contract (intent -> agent -> action) is the
same either way, which is what matters for the prototype.

Two kinds of intents:
  - Read intents  -> fetch and summarize (profile, setup status, my tasks...)
  - Action intents -> actually mutate state (advance setup, complete a task,
    retry a failed message) and confirm back in plain language.
Anything that doesn't match a known intent falls through to the Knowledge
Agent's RAG lookup, since most "tell me about X policy" questions live there.
"""

import re

from . import communication_agent, knowledge_agent, profile_agent, setup_agent, task_agent


def _setup_summary(steps: list) -> str:
    done = [s for s in steps if s["status"] == "done"]
    active = next((s for s in steps if s["status"] == "active"), None)
    lines = [f"Your IT setup is {len(done)}/{len(steps)} steps complete."]
    if active:
        lines.append(f"Currently in progress: **{active['name']}** ({active['detail']})")
    return " ".join(lines)


def _tasks_summary(tasks: list) -> str:
    open_tasks = [t for t in tasks if not t["done"]]
    if not open_tasks:
        return "You're all caught up — no open tasks right now."
    bullets = "\n".join(f"- {t['label']} ({t['priority']})" for t in open_tasks)
    return f"You have {len(open_tasks)} open task(s):\n{bullets}"


def _orgchart_summary(employee: dict, chart: list) -> str:
    manager = next((p for p in chart if p["name"] == employee["managerName"]), None)
    peers = [p["name"] for p in chart if not p.get("me") and p["name"] != employee["managerName"]]
    lines = [f"You're in **{employee['department']}**, reporting to **{employee['managerName']}**."]
    if peers:
        lines.append(f"Teammates: {', '.join(peers)}.")
    if manager:
        lines.append(f"Reach {manager['name']} on Teams (@{manager['teams']}) or {manager['email']}.")
    return " ".join(lines)


def handle(employee_id: str, message: str) -> dict:
    """Returns {reply, agent, action_taken, data}."""
    employee = profile_agent.get_employee(employee_id)  # raises 404 if the ID is bad
    text = message.lower().strip()

    # --- Action intents (mutate state) ---------------------------------------

    if re.search(r"\b(advance|next step|complete (the )?next|finish (the )?setup)\b", text):
        steps = setup_agent.advance_active_step(employee_id)
        done = sum(1 for s in steps if s["status"] == "done")
        return {
            "reply": f"Done — advanced your setup. {done}/{len(steps)} steps complete now. " + _setup_summary(steps),
            "agent": "Setup Agent",
            "action_taken": "advance_setup_step",
            "data": steps,
        }

    task_match = re.search(r"\b(mark|complete|finish)\b.*?\b(?:task\s+)?(.+?)\s*(?:as\s+)?(?:done|complete)\b", text)
    if task_match:
        keyword = task_match.group(2).strip()
        task = task_agent.find_task_by_keyword(employee_id, keyword)
        if task:
            updated = task_agent.set_task_done(employee_id, task["id"], True)
            return {
                "reply": f"Marked **{updated['label']}** as done.",
                "agent": "Daily Task Agent",
                "action_taken": "complete_task",
                "data": updated,
            }
        return {
            "reply": f"I couldn't find a task matching '{keyword}' — check the Daily Task Agent page for the exact wording.",
            "agent": "Daily Task Agent",
            "action_taken": None,
            "data": None,
        }

    if re.search(r"\b(retry|resend)\b", text):
        pending = communication_agent.find_retrying(employee_id)
        if pending:
            result = communication_agent.retry(employee_id, pending["id"])
            return {
                "reply": f"Retried **{result['subject']}** — status is now {result['status']}.",
                "agent": "Communication Agent",
                "action_taken": "retry_communication",
                "data": result,
            }
        return {
            "reply": "Nothing is currently stuck retrying — your communications are all delivered.",
            "agent": "Communication Agent",
            "action_taken": None,
            "data": None,
        }

    # --- Read intents (fetch + summarize) -------------------------------------

    if re.search(r"\b(manager|org chart|organi[sz]ation|my team|teammate|report to)\b", text):
        chart = profile_agent.get_orgchart(employee_id)
        return {"reply": _orgchart_summary(employee, chart), "agent": "Profile Agent", "action_taken": None, "data": chart}

    if re.search(r"\b(setup|provisioning|vpn|sso|okta|it access)\b", text):
        steps = setup_agent.get_steps(employee_id)
        return {"reply": _setup_summary(steps), "agent": "Setup Agent", "action_taken": None, "data": steps}

    if re.search(r"\b(my tasks?|to.?do|what.*(do|need to do))\b", text):
        tasks = task_agent.get_tasks(employee_id)
        return {"reply": _tasks_summary(tasks), "agent": "Daily Task Agent", "action_taken": None, "data": tasks}

    if re.search(r"\b(incident|issue|blocker)\b", text):
        incidents = task_agent.get_incidents(employee_id)
        reply = (
            "No open incidents."
            if not incidents
            else "Open incidents:\n" + "\n".join(f"- {i['label']} ({i['priority']})" for i in incidents)
        )
        return {"reply": reply, "agent": "Daily Task Agent", "action_taken": None, "data": incidents}

    if re.search(r"\b(training|course|module)\b", text):
        training = task_agent.get_training(employee_id)
        reply = "Required training:\n" + "\n".join(f"- {t['label']}" for t in training)
        return {"reply": reply, "agent": "Daily Task Agent", "action_taken": None, "data": training}

    if re.search(r"\b(email|message|communication|notification)s?\b", text):
        comms = communication_agent.get_communications(employee_id)
        reply = "Recent communications:\n" + "\n".join(f"- [{c['status']}] {c['subject']}" for c in comms[:5])
        return {"reply": reply, "agent": "Communication Agent", "action_taken": None, "data": comms}

    if re.search(r"\b(profile|who am i|my role|my title)\b", text):
        return {
            "reply": f"You're **{employee['name']}**, {employee['title']} in {employee['department']}, based in {employee['siteLocation']}.",
            "agent": "Profile Agent",
            "action_taken": None,
            "data": employee,
        }

    # --- Default: route to Knowledge Agent RAG ----------------------------------

    result = knowledge_agent.query(message)
    return {"reply": result["answer"], "agent": "Knowledge Agent", "action_taken": None, "data": result}
