// Command Center — unified prototype wiring. No backend; all data from data.js.
// The "orchestrator" inspects each message, picks one of the five specialist
// agents, and that agent answers in the same chat thread.

// ---------- Profile ----------
function ccRenderProfile() {
  document.getElementById("cc-name").textContent = EMPLOYEE.name;
  document.getElementById("cc-title").textContent = EMPLOYEE.title;
  document.getElementById("cc-meta").textContent = EMPLOYEE.meta;
  const initials = EMPLOYEE.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  document.getElementById("cc-avatar").textContent = initials.toUpperCase();
}

// ---------- Progress ----------
function ccSetupPct() {
  const done = SETUP_STEPS.filter((s) => s.status === "done").length;
  return Math.round((done / SETUP_STEPS.length) * 100);
}
function ccTasksPct() {
  const done = TASKS.filter((t) => t.done).length;
  return Math.round((done / TASKS.length) * 100);
}
function ccRenderProgress() {
  const setupPct = ccSetupPct();
  const tasksPct = ccTasksPct();
  const overall = Math.round((setupPct + tasksPct) / 2);
  document.getElementById("cc-overall").textContent = overall + "%";
  document.getElementById("cc-overall-2").textContent = overall + "%";
  document.getElementById("cc-setup-pct").textContent = setupPct + "%";
  document.getElementById("cc-tasks-pct").textContent = tasksPct + "%";
  const fill = document.getElementById("cc-progress-fill");
  fill.style.width = overall + "%";
  fill.textContent = overall + "%";

  const root = document.getElementById("cc-setup-steps");
  root.innerHTML = "";
  SETUP_STEPS.forEach((step) => {
    const div = document.createElement("div");
    div.className = "step-detail " + step.status;
    const mark = step.status === "done" ? "✓" : step.status === "active" ? "●" : "○";
    div.innerHTML = `<div class="step-name">${mark} ${step.name}</div>
      <div class="step-meta">${step.system} — ${step.detail}</div>`;
    root.appendChild(div);
  });
}

// ---------- Task check ----------
function ccRenderTaskItem(item, listId, toggle) {
  const list = document.getElementById(listId);
  const li = document.createElement("li");
  if (item.done) li.classList.add("completed");
  li.innerHTML = `${toggle ? `<input type="checkbox" ${item.done ? "checked" : ""} />` : ""}
    <span class="label">${item.label}</span>
    <span class="badge ${item.priority}">${item.priority}</span>`;
  if (toggle) {
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      li.classList.toggle("completed", item.done);
      ccRenderProgress(); // live-update progress when a task is checked
    });
  }
  list.appendChild(li);
}
function ccRenderTasks() {
  TASKS.forEach((t) => ccRenderTaskItem(t, "cc-tasks-list", true));
  INCIDENTS.forEach((i) => ccRenderTaskItem(i, "cc-incidents-list", false));
  TRAINING.forEach((t) => ccRenderTaskItem(t, "cc-training-list", false));
}
function ccSetupTabs() {
  const tabs = document.querySelectorAll(".tasks-tabs .tab");
  const panels = { tasks: "cc-tasks-list", incidents: "cc-incidents-list", training: "cc-training-list" };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(panels).forEach((id) => (document.getElementById(id).hidden = true));
      document.getElementById(panels[tab.dataset.tab]).hidden = false;
    });
  });
}

// ---------- Communication: single thread ----------
function ccRenderCommThread() {
  const root = document.getElementById("cc-comm-thread");
  root.innerHTML = "";
  COMMUNICATIONS.forEach((c) => {
    const div = document.createElement("div");
    div.className = "comm-bubble";
    div.innerHTML = `
      <div class="top">
        <span class="chan">${c.channel}</span>
        <span class="subj">${c.subject}</span>
        <span class="time">${c.time}</span>
      </div>
      <div class="rcpt">${c.recipient}</div>
      <div style="margin-top:6px"><span class="comm-status ${c.status}">${c.status}</span></div>`;
    root.appendChild(div);
  });
  root.scrollTop = root.scrollHeight;
}

// ---------- Organization chart ----------
function ccOrg(id) {
  return ORG_CHART.find((p) => p.id === id);
}
function ccNodeHtml(person) {
  const cls = "node" + (person.me ? " me" : "") + (/lead|vp/i.test(person.role) ? " lead" : "");
  return `<div class="${cls}" data-id="${person.id}">
      <div class="nm">${person.name}</div>
      <div class="rl">${person.role}</div>
    </div>`;
}
function ccRenderOrgTree() {
  const root = document.getElementById("cc-orgtree");
  if (!root) return;
  // Hierarchy: VP → Engineering Lead → team (you + peers + devops)
  const vp = ccOrg("vp");
  const mgr = ccOrg("mgr");
  const reports = ["me", "peer1", "peer2", "devops"].map(ccOrg).filter(Boolean);
  root.innerHTML = `
    <ul>
      <li>
        ${ccNodeHtml(vp)}
        <ul>
          <li>
            ${ccNodeHtml(mgr)}
            <ul>
              ${reports.map((p) => `<li>${ccNodeHtml(p)}</li>`).join("")}
            </ul>
          </li>
        </ul>
      </li>
    </ul>`;
  root.querySelectorAll(".node").forEach((el) => {
    el.addEventListener("click", (e) => {
      const person = ccOrg(el.dataset.id);
      ccShowContact(person, e);
    });
  });
}
function ccShowContact(person, evt) {
  const popup = document.getElementById("cc-contact-popup");
  if (!popup) return;
  if (person.me) { popup.hidden = true; return; }
  popup.innerHTML = `
    <strong>${person.name}</strong><br/>
    <span style="color:var(--muted)">${person.role}</span>
    <a href="https://teams.microsoft.com/l/chat/0/0?users=${person.email}" target="_blank" rel="noopener">Message on Teams</a>
    <a href="mailto:${person.email}">Email ${person.email}</a>
    <button type="button" id="cc-popup-close">Close</button>`;
  popup.hidden = false;
  const pad = 12;
  let x = evt.clientX, y = evt.clientY + 8;
  popup.style.left = Math.min(x, window.innerWidth - popup.offsetWidth - pad) + "px";
  popup.style.top = Math.min(y, window.innerHeight - popup.offsetHeight - pad) + "px";
  document.getElementById("cc-popup-close").addEventListener("click", () => (popup.hidden = true));
}
document.addEventListener("click", (e) => {
  const popup = document.getElementById("cc-contact-popup");
  if (popup && !popup.hidden && !popup.contains(e.target) && !e.target.closest(".node")) {
    popup.hidden = true;
  }
});

// ============ ORCHESTRATOR ============
const AGENT_LABELS = {
  profile: "Profile Agent",
  setup: "Setup Agent",
  knowledge: "Knowledge Agent",
  communication: "Communication Agent",
  task: "Daily Task Agent",
};

// Decide which specialist agent handles the message.
function ccRoute(q) {
  q = q.toLowerCase();
  if (/(email sent|did .*send|welcome email|notification|notified|manager alert|message.*sent|sent.*message|communication|teams post|calendar invite|reminder)/.test(q))
    return "communication";
  if (/(who is|who's|who are|my manager|manager|my team|team\b|org ?chart|report to|reports to|colleague|peer|buddy|contact|reach |my role|my profile|who do i)/.test(q))
    return "profile";
  if (/(my task|tasks?\b|to-?do|todo|checklist|due|deadline|training|incident|what should i do|what do i need|my day|today)/.test(q))
    return "task";
  if (/(progress|how far|provision|setup status|set ?up|installed|software|vpn access|sharepoint|workday|okta|sso|mfa|account ready|provisioned|how much|complete)/.test(q))
    return "setup";
  return "knowledge"; // fallback: knowledge base lookup
}

function ccProfileAnswer(q) {
  q = q.toLowerCase();
  if (q.includes("manager")) {
    const m = ORG_CHART.find((p) => /lead/i.test(p.role) && !p.me) || ORG_CHART[1];
    return `Your manager is <b>${m.name}</b> — ${m.role}.<br/>
      <a href="https://teams.microsoft.com/l/chat/0/0?users=${m.email}" target="_blank" style="color:var(--accent-teal)">Message on Teams</a> ·
      <a href="mailto:${m.email}" style="color:var(--accent-teal)">${m.email}</a>`;
  }
  if (/team|org|who|peer|colleague|buddy/.test(q)) {
    const rows = ORG_CHART.map((p) => `• <b>${p.name}</b> — ${p.role}`).join("<br/>");
    return `Here's your team / reporting line:<br/>${rows}`;
  }
  return `You are <b>${EMPLOYEE.name}</b>, ${EMPLOYEE.title}.<br/>${EMPLOYEE.meta}`;
}

function ccSetupAnswer(q) {
  q = q.toLowerCase();
  const named = SETUP_STEPS.find((s) => q.includes(s.name.toLowerCase().split(" ")[0]));
  if (named && !/progress|how far|status|overall/.test(q)) {
    const mark = named.status === "done" ? "completed ✓" : named.status === "active" ? "in progress ●" : "pending ○";
    return `<b>${named.name}</b> (${named.system}) — ${mark}.<br/>${named.detail}`;
  }
  const pct = ccSetupPct();
  const lines = SETUP_STEPS.map((s) => {
    const mark = s.status === "done" ? "✓" : s.status === "active" ? "●" : "○";
    return `${mark} ${s.name}`;
  }).join("&nbsp;&nbsp; ");
  return `IT setup is <b>${pct}% complete</b> (${SETUP_STEPS.filter((s) => s.status === "done").length}/${SETUP_STEPS.length} systems).<br/>${lines}`;
}

function ccTaskAnswer(q) {
  q = q.toLowerCase();
  if (q.includes("training")) {
    return `You have <b>${TRAINING.length} trainings</b> due:<br/>` +
      TRAINING.map((t) => `• ${t.label}`).join("<br/>");
  }
  if (q.includes("incident")) {
    return `<b>${INCIDENTS.length} open incidents</b>:<br/>` +
      INCIDENTS.map((i) => `• ${i.label} (${i.priority})`).join("<br/>");
  }
  const open = TASKS.filter((t) => !t.done);
  return `You have <b>${open.length} open task${open.length === 1 ? "" : "s"}</b> today:<br/>` +
    open.map((t) => `• ${t.label} (${t.priority})`).join("<br/>");
}

function ccCommAnswer(q) {
  const sent = COMMUNICATIONS.filter((c) => c.status === "Sent").length;
  const retry = COMMUNICATIONS.filter((c) => c.status === "Retrying").length;
  const last = COMMUNICATIONS.slice(-3).map((c) => `• [${c.channel}] ${c.subject} — ${c.status}`).join("<br/>");
  return `${COMMUNICATIONS.length} communications logged — <b>${sent} sent</b>${retry ? `, ${retry} retrying` : ""}. Recent:<br/>${last}<br/>
    <span style="color:var(--on-dark-soft);font-size:12px">Full thread is in the Communication panel.</span>`;
}

function ccKnowledgeAnswer(q) {
  const lc = q.toLowerCase();
  const hit = KB_ANSWERS.find((e) => e.keywords.some((kw) => lc.includes(kw)));
  if (hit) {
    return `${hit.answer}<span class="citation">Source: ${hit.source.title} (${hit.source.category})</span>`;
  }
  return `I couldn't find a confident match in the knowledge base. Try keywords like “VPN”, “password”, “expense”, “data classification”, or “Day 1”.`;
}

const AGENT_ANSWER = {
  profile: ccProfileAnswer,
  setup: ccSetupAnswer,
  task: ccTaskAnswer,
  communication: ccCommAnswer,
  knowledge: ccKnowledgeAnswer,
};

function ccAppend(role, html, extraClass) {
  const win = document.getElementById("cc-chat-window");
  const div = document.createElement("div");
  div.className = "msg " + role + (extraClass ? " " + extraClass : "");
  div.innerHTML = html;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function ccHandle(question) {
  ccAppend("user", question);
  const agent = ccRoute(question);
  const label = AGENT_LABELS[agent];
  // orchestrator routing line
  ccAppend("route", `Orchestrator → routing to <b>${label}</b>…`);
  setTimeout(() => {
    const html = AGENT_ANSWER[agent](question);
    ccAppend("bot", `<span class="agent-tag tag-${agent}">${label}</span><br/>${html}`);
  }, 450);
}

function ccSetupChat() {
  const form = document.getElementById("cc-chat-form");
  const input = document.getElementById("cc-chat-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    ccHandle(q);
  });

  const suggestions = [
    "What's my setup progress?",
    "Who's my manager?",
    "What are my tasks today?",
    "How do I get VPN access?",
    "Did my welcome email send?",
  ];
  const row = document.getElementById("cc-suggest");
  row.innerHTML = suggestions.map((s) => `<button type="button" class="suggest">${s}</button>`).join("");
  row.querySelectorAll(".suggest").forEach((b) =>
    b.addEventListener("click", () => ccHandle(b.textContent))
  );

  // greeting
  ccAppend("bot", `<span class="agent-tag tag-communication">Orchestrator</span><br/>
    Hi ${EMPLOYEE.name.split(" ")[0]} — I coordinate your Profile, Setup, Knowledge, Communication, and Daily Task agents. Ask me anything, or tap a suggestion below.`);
}

document.addEventListener("DOMContentLoaded", () => {
  ccRenderProfile();
  ccRenderProgress();
  ccRenderTasks();
  ccSetupTabs();
  ccRenderCommThread();
  ccRenderOrgTree();
  ccSetupChat();
});
