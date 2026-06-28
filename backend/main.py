"""AWS-IQ backend — one router section per agent from design.md, plus the
Orchestrator Agent that fronts all of them behind a single chat endpoint.

Run from the repo root:
    uvicorn backend.main:app --reload --port 8000

Then open http://localhost:8000/docs to try every agent endpoint directly.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agents import communication_agent, knowledge_agent, orchestrator_agent, profile_agent, setup_agent, task_agent

app = FastAPI(title="AWS-IQ Onboarding Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dashboard is served as static files / file://, so allow all for this prototype
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# --- Identity (employee ID lookup gate) ---------------------------------------

@app.get("/api/employees")
def list_employees():
    """Used by the landing page so judges can see which IDs to try."""
    return profile_agent.list_employees()


@app.get("/api/employees/{employee_id}")
def lookup_employee(employee_id: str):
    """The ID-entry step: confirms the employee exists before unlocking the rest of the app."""
    return profile_agent.get_employee(employee_id)


# --- Orchestrator Agent ---------------------------------------------------------

class ChatMessage(BaseModel):
    employee_id: str
    message: str


@app.post("/api/orchestrator/chat")
def orchestrator_chat(body: ChatMessage):
    """Single combined chatbox — routes to whichever specialist agent the message needs,
    and can execute actions (advance setup, complete a task, retry a message), not just answer."""
    return orchestrator_agent.handle(body.employee_id, body.message)


# --- Profile Agent ---------------------------------------------------------

@app.get("/api/profile/{employee_id}")
def get_profile(employee_id: str):
    return profile_agent.get_employee(employee_id)


@app.get("/api/orgchart/{employee_id}")
def get_orgchart(employee_id: str):
    return profile_agent.get_orgchart(employee_id)


# --- Setup Agent ------------------------------------------------------------

@app.get("/api/setup/{employee_id}/steps")
def get_setup_steps(employee_id: str):
    return setup_agent.get_steps(employee_id)


@app.post("/api/setup/{employee_id}/advance")
def advance_setup(employee_id: str):
    """Simulates the next provisioning Lambda completing — see the 'Advance Step' button on setup.html."""
    return setup_agent.advance_active_step(employee_id)


# --- Knowledge Agent ---------------------------------------------------------

class KnowledgeQuery(BaseModel):
    question: str


@app.post("/api/knowledge/query")
def query_knowledge(body: KnowledgeQuery):
    return knowledge_agent.query(body.question)


@app.get("/api/faq")
def get_faq(category: str | None = None):
    return knowledge_agent.get_faq(category)


# --- Communication Agent -----------------------------------------------------

@app.get("/api/communications/{employee_id}")
def get_communications(employee_id: str):
    return communication_agent.get_communications(employee_id)


@app.post("/api/communications/{employee_id}/{comm_id}/retry")
def retry_communication(employee_id: str, comm_id: str):
    return communication_agent.retry(employee_id, comm_id)


# --- Daily Task Agent ---------------------------------------------------------

@app.get("/api/tasks/{employee_id}")
def get_tasks(employee_id: str):
    return task_agent.get_tasks(employee_id)


class TaskUpdate(BaseModel):
    done: bool


@app.patch("/api/tasks/{employee_id}/{task_id}")
def update_task(employee_id: str, task_id: str, body: TaskUpdate):
    return task_agent.set_task_done(employee_id, task_id, body.done)


@app.get("/api/incidents/{employee_id}")
def get_incidents(employee_id: str):
    return task_agent.get_incidents(employee_id)


@app.get("/api/training/{employee_id}")
def get_training(employee_id: str):
    return task_agent.get_training(employee_id)


# --- Overview ---------------------------------------------------------------

@app.get("/api/overview/{employee_id}")
def get_overview(employee_id: str):
    """Aggregated summary used by the Overview page's agent cards."""
    steps = setup_agent.get_steps(employee_id)
    tasks = task_agent.get_tasks(employee_id)
    incidents = task_agent.get_incidents(employee_id)
    training = task_agent.get_training(employee_id)
    comms = communication_agent.get_communications(employee_id)
    done_steps = sum(1 for s in steps if s["status"] == "done")
    return {
        "employee": profile_agent.get_employee(employee_id),
        "setup": {"donePct": round(done_steps / len(steps) * 100), "done": done_steps, "total": len(steps)},
        "tasks": {"open": sum(1 for t in tasks if not t["done"]), "total": len(tasks)},
        "incidents": len(incidents),
        "training": len(training),
        "communications": len(comms),
    }
