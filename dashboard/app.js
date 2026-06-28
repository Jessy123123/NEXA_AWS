// All data now comes from the FastAPI backend (see backend/main.py) — no more
// hardcoded mock arrays. Each render function fetches its own agent endpoint.

const API_BASE = "http://localhost:8000/api";

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function showBackendError(message) {
  const banner = document.getElementById("backend-error");
  if (!banner) return;
  banner.textContent = message;
  banner.hidden = false;
}

// --- Profile Agent -----------------------------------------------------------

async function renderProfile() {
  const nameEl = document.getElementById("emp-name");
  if (!nameEl) return;
  const employee = await api("/profile");
  nameEl.textContent = employee.name;
  document.getElementById("emp-title").textContent = employee.title;
  document.getElementById("emp-meta").textContent = employee.meta;
}

async function renderOrgChart() {
  const root = document.getElementById("orgchart");
  if (!root) return;
  const people = await api("/orgchart");
  root.innerHTML = "";
  people.forEach((person) => {
    const node = document.createElement("div");
    node.className = "org-node" + (person.me ? " me" : "");
    node.innerHTML = `<strong>${person.name}</strong><div class="role">${person.role}</div>`;
    node.addEventListener("click", (e) => showContactPopup(person, e));
    root.appendChild(node);
  });
}

function showContactPopup(person, evt) {
  const popup = document.getElementById("contact-popup");
  if (!popup) return;
  if (person.me) { popup.hidden = true; return; }
  popup.innerHTML = `
    <strong>${person.name}</strong><br/>
    <span style="color:var(--muted)">${person.role}</span>
    <a href="https://teams.microsoft.com/l/chat/0/0?users=${person.email}" target="_blank" rel="noopener">Message on Teams</a>
    <a href="mailto:${person.email}">Email ${person.email}</a>
    <button id="popup-close">Close</button>
  `;
  popup.hidden = false;
  popup.style.left = evt.clientX + "px";
  popup.style.top = evt.clientY + "px";
  document.getElementById("popup-close").addEventListener("click", () => (popup.hidden = true));
}

// --- Daily Task Agent ---------------------------------------------------------

function renderTaskItem(item, listId, { onToggle } = {}) {
  const list = document.getElementById(listId);
  if (!list) return;
  const li = document.createElement("li");
  if (item.done) li.classList.add("completed");
  li.innerHTML = `
    ${onToggle ? `<input type="checkbox" ${item.done ? "checked" : ""} />` : ""}
    <span class="label">${item.label}</span>
    <span class="badge ${item.priority}">${item.priority}</span>
  `;
  if (onToggle) {
    li.querySelector("input").addEventListener("change", async (e) => {
      const done = e.target.checked;
      li.classList.toggle("completed", done);
      try {
        await api(`/tasks/${item.id}`, { method: "PATCH", body: JSON.stringify({ done }) });
      } catch (err) {
        e.target.checked = !done; // revert on failure
        li.classList.toggle("completed", !done);
        showBackendError("Couldn't save task update — is the backend running on :8000?");
      }
    });
  }
  list.appendChild(li);
}

async function renderTasksPanel() {
  if (!document.getElementById("tasks-list")) return;
  const [tasks, incidents, training] = await Promise.all([
    api("/tasks"),
    api("/incidents"),
    api("/training"),
  ]);
  document.getElementById("tasks-list").innerHTML = "";
  document.getElementById("incidents-list").innerHTML = "";
  document.getElementById("training-list").innerHTML = "";
  tasks.forEach((t) => renderTaskItem(t, "tasks-list", { onToggle: true }));
  incidents.forEach((i) => renderTaskItem(i, "incidents-list", {}));
  training.forEach((t) => renderTaskItem(t, "training-list", {}));
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;
  const panels = { tasks: "tasks-list", incidents: "incidents-list", training: "training-list" };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(panels).forEach((id) => (document.getElementById(id).hidden = true));
      document.getElementById(panels[tab.dataset.tab]).hidden = false;
    });
  });
}

// --- Knowledge Agent ---------------------------------------------------------

function appendChatMessage(role, html) {
  const win = document.getElementById("chat-window");
  if (!win) return;
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = html;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function setupChat() {
  const form = document.getElementById("chat-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const question = input.value.trim();
    if (!question) return;
    appendChatMessage("user", question);
    input.value = "";

    try {
      const result = await api("/knowledge/query", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      const citationHtml = result.citations
        .map((c) => `Source: ${c.title} (${c.category})`)
        .join("<br/>");
      const modeNote =
        result.mode === "fallback"
          ? `<span class="citation" style="opacity:.7">[local extract — Bedrock KB not connected]</span>`
          : "";
      appendChatMessage("bot", `${result.answer}<span class="citation">${citationHtml}</span>${modeNote}`);
    } catch (err) {
      appendChatMessage("bot", "Couldn't reach the Knowledge Agent backend — is it running on :8000?");
    }
  });
}

async function renderFaq(category = "All") {
  const list = document.getElementById("faq-list");
  if (!list) return;
  const faqs = await api(`/faq?category=${encodeURIComponent(category)}`);
  list.innerHTML = "";
  faqs.forEach((f) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `
      <div class="faq-q"><span><span class="faq-cat">${f.category}</span>${f.q}</span><span>+</span></div>
      <div class="faq-a">${f.a}<br/><span style="font-size:11px;opacity:.7">Source: ${f.source}</span></div>
    `;
    item.querySelector(".faq-q").addEventListener("click", () => item.classList.toggle("open"));
    list.appendChild(item);
  });
}

function setupFaqSearch() {
  const search = document.getElementById("faq-search");
  if (!search) return;
  let allFaqs = [];
  api("/faq").then((data) => (allFaqs = data));
  search.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const list = document.getElementById("faq-list");
    const filtered = allFaqs.filter(
      (f) => f.q.toLowerCase().includes(term) || f.category.toLowerCase().includes(term)
    );
    list.innerHTML = "";
    filtered.forEach((f) => {
      const item = document.createElement("div");
      item.className = "faq-item";
      item.innerHTML = `
        <div class="faq-q"><span><span class="faq-cat">${f.category}</span>${f.q}</span><span>+</span></div>
        <div class="faq-a">${f.a}<br/><span style="font-size:11px;opacity:.7">Source: ${f.source}</span></div>
      `;
      item.querySelector(".faq-q").addEventListener("click", () => item.classList.toggle("open"));
      list.appendChild(item);
    });
  });
}

async function setupFaqCategoryChips() {
  const row = document.getElementById("faq-categories");
  if (!row) return;
  const faqs = await api("/faq");
  const categories = ["All", ...new Set(faqs.map((f) => f.category))];
  row.innerHTML = categories
    .map((c, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  row.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderFaq(chip.dataset.cat);
    });
  });
}

// --- Setup Agent --------------------------------------------------------------

function renderSetupStepsFromData(steps) {
  const root = document.getElementById("setup-steps");
  const doneCount = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const fill = document.getElementById("progress-fill");
  if (fill) {
    fill.style.width = pct + "%";
    fill.textContent = pct + "%";
  }
  root.innerHTML = "";
  steps.forEach((step) => {
    const div = document.createElement("div");
    div.className = "step-detail " + step.status;
    div.innerHTML = `
      <div class="step-name">${step.status === "done" ? "✓" : step.status === "active" ? "●" : "○"} ${step.name}</div>
      <div class="step-meta">${step.system} — ${step.detail}</div>
    `;
    root.appendChild(div);
  });
  const btn = document.getElementById("advance-step-btn");
  if (btn) btn.disabled = doneCount === steps.length;
}

async function renderSetupSteps() {
  const root = document.getElementById("setup-steps");
  if (!root) return;
  renderSetupStepsFromData(await api("/setup/steps"));
}

function setupAdvanceButton() {
  const btn = document.getElementById("advance-step-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      renderSetupStepsFromData(await api("/setup/advance", { method: "POST" }));
    } catch (err) {
      showBackendError("Couldn't advance setup — is the backend running on :8000?");
    }
  });
}

// --- Communication Agent -------------------------------------------------------

async function renderCommunications() {
  const list = document.getElementById("comm-list");
  if (!list) return;
  const comms = await api("/communications");
  list.innerHTML = "";
  comms.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="channel">${c.channel}</span>
      <span class="subject">${c.subject}<br/><span class="recipient">${c.recipient} · ${c.time}</span></span>
      <span class="comm-status ${c.status}">${c.status}</span>
      ${c.status === "Retrying" ? `<button class="retry-btn" data-id="${c.id}">Retry now</button>` : ""}
    `;
    list.appendChild(li);
  });
  list.querySelectorAll(".retry-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        await api(`/communications/${btn.dataset.id}/retry`, { method: "POST" });
        renderCommunications();
      } catch (err) {
        showBackendError("Retry failed — is the backend running on :8000?");
        btn.disabled = false;
      }
    });
  });
}

// --- Overview ------------------------------------------------------------------

async function renderOverview() {
  const root = document.getElementById("overview-grid");
  if (!root) return;
  const o = await api("/overview");
  const cards = [
    { label: "Profile Agent", href: "profile.html", h: o.employee.name, p: o.employee.title },
    { label: "Setup Agent", href: "setup.html", h: o.setup.donePct + "% complete", p: `${o.setup.done}/${o.setup.total} provisioning steps done` },
    { label: "Knowledge Agent", href: "knowledge.html", h: "Ask anything", p: "RAG over IT, HR, Security, Finance docs — cited" },
    { label: "Communication Agent", href: "communication.html", h: o.communications + " messages sent", p: "Welcome email, manager alerts, Teams, calendar" },
    { label: "Daily Task Agent", href: "tasks.html", h: o.tasks.open + " tasks open", p: `${o.incidents} incidents, ${o.training} trainings due` },
  ];
  root.innerHTML = cards
    .map(
      (c) => `
      <a class="agent-card" href="${c.href}">
        <div class="agent-label">${c.label}</div>
        <div class="stat">${c.h}</div>
        <p>${c.p}</p>
      </a>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const tasks = [
    renderProfile(),
    renderOrgChart(),
    renderTasksPanel(),
    renderFaq(),
    renderSetupSteps(),
    renderCommunications(),
    renderOverview(),
  ];
  setupTabs();
  setupChat();
  setupFaqSearch();
  setupFaqCategoryChips();
  setupAdvanceButton();

  Promise.allSettled(tasks).then((results) => {
    if (results.some((r) => r.status === "rejected")) {
      showBackendError("Couldn't reach the backend at " + API_BASE + " — run `uvicorn backend.main:app --reload` from the repo root.");
    }
  });
});
