"""AWS-IQ backend — one FastAPI router section per agent from design.md.

Run from the repo root:
    uvicorn backend.main:app --reload --port 8000

Then open http://localhost:8000/docs to try every agent endpoint directly.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agents import communication_agent, knowledge_agent, profile_agent, setup_agent, task_agent

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


# --- Profile Agent ---------------------------------------------------------

@app.get("/api/profile")
def get_profile():
    return profile_agent.get_employee()


@app.get("/api/orgchart")
def get_orgchart():
    return profile_agent.get_orgchart()


# --- Setup Agent ------------------------------------------------------------

@app.get("/api/setup/steps")
def get_setup_steps():
    return setup_agent.get_steps()


@app.post("/api/setup/advance")
def advance_setup():
    """Simulates the next provisioning Lambda completing — see the 'Advance Step' button on setup.html."""
    return setup_agent.advance_active_step()


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

@app.get("/api/communications")
def get_communications():
    return communication_agent.get_communications()


@app.post("/api/communications/{comm_id}/retry")
def retry_communication(comm_id: str):
    return communication_agent.retry(comm_id)


# --- Daily Task Agent ---------------------------------------------------------

@app.get("/api/tasks")
def get_tasks():
    return task_agent.get_tasks()


class TaskUpdate(BaseModel):
    done: bool


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: str, body: TaskUpdate):
    return task_agent.set_task_done(task_id, body.done)


@app.get("/api/incidents")
def get_incidents():
    return task_agent.get_incidents()


@app.get("/api/training")
def get_training():
    return task_agent.get_training()


# --- Overview ---------------------------------------------------------------

@app.get("/api/overview")
def get_overview():
    """Aggregated summary used by the Overview page's agent cards."""
    steps = setup_agent.get_steps()
    tasks = task_agent.get_tasks()
    incidents = task_agent.get_incidents()
    training = task_agent.get_training()
    comms = communication_agent.get_communications()
    done_steps = sum(1 for s in steps if s["status"] == "done")
    return {
        "employee": profile_agent.get_employee(),
        "setup": {"donePct": round(done_steps / len(steps) * 100), "done": done_steps, "total": len(steps)},
        "tasks": {"open": sum(1 for t in tasks if not t["done"]), "total": len(tasks)},
        "incidents": len(incidents),
        "training": len(training),
        "communications": len(comms),
    }
