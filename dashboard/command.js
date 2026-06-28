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

  ccRenderPath();
}

// Onboarding journey as a vertical bubble-dot timeline: done = filled circle
// with a tick, in-progress = filled accent dot, pending = hollow bubble.
// Setup steps come first (provisioning sequence), then personal tasks.
function ccRenderPath() {
  const root = document.getElementById("cc-path");
  if (!root) return;

  const items = [];
  SETUP_STEPS.forEach((s) => {
    const state = s.status === "done" ? "done" : s.status === "active" ? "active" : "pending";
    items.push({
      kind: "setup", state, label: s.name, meta: s.system, resolveId: s.resolveId,
      tag: state === "active" ? "active" : "setup",
      tagText: state === "active" ? "In progress" : "Setup",
    });
  });
  TASKS.forEach((t, i) => {
    items.push({
      kind: "task", taskIndex: i, state: t.done ? "done" : "pending", resolveId: t.resolveId,
      label: t.label, meta: `${t.priority} priority`, tag: "task", tagText: "Task",
    });
  });

  const remaining = items.filter((i) => i.state !== "done").length;
  const countEl = document.getElementById("cc-path-count");
  if (countEl) countEl.textContent = remaining ? `· ${remaining} to go` : "· all done ✓";

  root.innerHTML = items
    .map((i, idx) => {
      const dot = i.state === "done" ? "✓" : "";
      const clickable = i.kind === "task" ? " clickable" : "";
      const data = i.kind === "task" ? ` data-task="${i.taskIndex}"` : "";
      const resolveBtn = i.state !== "done" && i.resolveId
        ? `<button type="button" class="resolve-btn" data-resolve="${i.resolveId}" data-path-idx="${idx}">Resolve now</button>`
        : "";
      return `<div class="path-item ${i.state}${clickable}"${data}>
        <div class="path-dot">${dot}</div>
        <div class="path-label">${i.label}<span class="path-tag ${i.tag}">${i.tagText}</span></div>
        <div class="path-meta">${i.meta}</div>
        ${resolveBtn}
      </div>`;
    })
    .join("");

  // task dots are clickable to toggle done — keeps the path and Task Check in sync
  root.querySelectorAll(".path-item.clickable").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".resolve-btn")) return;
      const idx = +el.dataset.task;
      TASKS[idx].done = !TASKS[idx].done;
      ccRenderTaskCheckList();
      ccRenderProgress();
    });
  });

  // "Resolve now" buttons drive the same Setup Agent simulation as chat, so judges
  // can demo every incomplete item with one click instead of typing the right phrase.
  root.querySelectorAll(".resolve-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = ccFindInstallItemById(btn.dataset.resolve);
      if (!item) return;
      ccAppend("user", `Resolve: ${item.label}`);
      ccHandleInstall(item);
    });
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
function ccRenderTaskCheckList() {
  const list = document.getElementById("cc-tasks-list");
  if (!list) return;
  list.innerHTML = "";
  TASKS.forEach((t) => ccRenderTaskItem(t, "cc-tasks-list", true));
}
function ccRenderTasks() {
  ccRenderTaskCheckList();
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
  const ICON = { Email: "✉", Teams: "\u{1F4AC}", Calendar: "\u{1F4C5}" };
  COMMUNICATIONS.forEach((c) => {
    const cls = c.channel.toLowerCase();
    const div = document.createElement("div");
    div.className = "comm-item";
    div.innerHTML = `
      <div class="comm-ico ${cls}">${ICON[c.channel] || "•"}</div>
      <div class="comm-body">
        <div class="comm-row1">
          <span class="comm-subj">${c.subject}</span>
          <span class="comm-status ${c.status}">${c.status}</span>
        </div>
        <div class="comm-meta"><span class="chan">${c.channel}</span> &middot; ${c.recipient}</div>
        <div class="comm-time">${c.time}</div>
      </div>`;
    root.appendChild(div);
  });
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
    el.addEventListener("click", () => {
      const person = ccOrg(el.dataset.id);
      ccShowContact(person, el);
    });
  });
}
function ccShowContact(person, nodeEl) {
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

  // position beside the clicked node (viewport coords; popup is position:fixed)
  const rect = nodeEl.getBoundingClientRect();
  const pad = 10;
  const pw = popup.offsetWidth, ph = popup.offsetHeight;
  let left = rect.right + 8;                 // default: to the right of the node
  if (left + pw + pad > window.innerWidth) {
    left = rect.left - pw - 8;               // not enough room → flip to the left
  }
  left = Math.max(pad, Math.min(left, window.innerWidth - pw - pad));
  let top = rect.top;                        // align with the node's top
  top = Math.max(pad, Math.min(top, window.innerHeight - ph - pad));
  popup.style.left = left + "px";
  popup.style.top = top + "px";

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
  const entry = hit || KB_DEFAULT_ANSWER;
  return `${entry.answer}<span class="citation">Source: ${entry.source.title} (${entry.source.category})</span>`;
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
  return div;
}

// ---- Setup Agent: install simulation (hardcoded "haven't downloaded X" flow) ----
// Lives inside the same Orchestrator chatbox — the Orchestrator still routes here,
// it just hands off to a streamed fake-terminal response instead of a one-line answer.

const INSTALL_ITEMS = [
  {
    id: "python", label: "Python 3.12 + pip", keywords: ["python", "pip", "package"],
    taskKeywords: ["dev environment"],
    log: [
      "$ checking for python3...", "  not found",
      "$ downloading python-3.12.7-installer...", "  [##########] 100%",
      "$ running installer...", "$ pip install -r requirements.txt",
      "  Successfully installed boto3 fastapi uvicorn",
    ],
  },
  {
    id: "vpn", label: "VPN client (Cisco AnyConnect)", keywords: ["vpn", "anyconnect", "cisco"],
    taskKeywords: ["vpn"], setupKeywords: ["vpn"],
    log: [
      "$ provisioning VPN profile for employee...",
      "$ downloading Cisco AnyConnect client...", "  [##########] 100%",
      "$ installing certificate...", "$ testing tunnel to corp gateway...",
      "  connection established (12ms)",
    ],
  },
  {
    id: "docker", label: "Docker Desktop", keywords: ["docker"],
    taskKeywords: ["dev environment"],
    log: [
      "$ checking for docker...", "  not found",
      "$ downloading Docker Desktop...", "  [##########] 100%",
      "$ starting docker daemon...", "$ docker --version", "  Docker version 27.3.1",
    ],
  },
  {
    id: "ide", label: "IDE + extensions", keywords: ["ide", "vscode", "vs code", "editor"],
    taskKeywords: ["dev environment"],
    log: [
      "$ installing VS Code...", "  [##########] 100%",
      "$ installing extensions: Python, ESLint, GitLens...", "  3/3 extensions installed",
    ],
  },
  {
    id: "slack", label: "Slack workspace access", keywords: ["slack"],
    log: [
      "$ provisioning Slack workspace invite...",
      "$ sending invite to your @techventure.com.my email...", "  invite sent",
      "$ joining #platform-team, #engineering, #general...", "  joined 3 channels",
    ],
  },
  {
    id: "mfa", label: "MFA (YubiKey + authenticator)", keywords: ["mfa", "yubikey", "authenticator", "2fa"],
    taskKeywords: ["mfa"],
    log: [
      "$ registering YubiKey...", "$ pairing authenticator app...",
      "$ generating backup codes...", "  10 backup codes generated",
    ],
  },
  {
    id: "training", label: "Security Awareness Module 1", keywords: ["security awareness", "training module", "lms"],
    taskKeywords: ["security awareness"],
    log: [
      "$ opening LMS — Security Awareness Module 1...",
      "$ loading course content...", "  [##########] 100%",
      "$ submitting quiz answers...", "  score: 9/10 — passed",
      "$ recording completion in LMS...",
    ],
  },
  {
    id: "benefits", label: "Benefits enrollment", keywords: ["benefits", "enrollment", "enroll"],
    taskKeywords: ["benefits enrollment"],
    log: [
      "$ opening Workday benefits portal...",
      "$ loading plan options...", "  [##########] 100%",
      "$ submitting elections (medical, dental, EPF top-up)...",
      "  enrollment confirmed",
    ],
  },
  {
    id: "okta", label: "Workday / Okta SSO", keywords: ["okta", "sso", "workday"],
    setupKeywords: ["okta"],
    log: [
      "$ checking Okta enrollment status...", "  pending confirmation",
      "$ confirming enrollment with IT Operations...",
      "$ syncing Workday SSO profile...", "  sync complete",
    ],
  },
  {
    id: "software", label: "Software Installation (SCCM / Intune)", keywords: ["software installation", "sccm", "intune"],
    setupKeywords: ["software installation"],
    log: [
      "$ connecting to SCCM / Intune...",
      "$ pushing engineering toolchain package...", "  [##########] 100%",
      "$ installing IDE, Docker, local DB tooling...",
      "  all packages installed",
    ],
  },
  {
    id: "devenv", label: "Dev environment (IDE, local DB, Docker)", keywords: ["dev environment", "local db", "devenv"],
    taskKeywords: ["dev environment"], setupKeywords: ["software installation"],
    log: [
      "$ installing Docker Desktop...", "  [##########] 100%",
      "$ installing VS Code + extensions...", "  [##########] 100%",
      "$ provisioning local Postgres instance...", "  ready on :5432",
    ],
  },
];

const INSTALL_INTENT_RE = /(haven'?t (downloaded|installed|got|set ?up)|don'?t have|isn'?t installed|not installed|need (to )?(install|download|set ?up)|how do i (install|download|set ?up)|help me (install|download|set ?up))/i;

const ccInstalled = new Set();

function ccFindInstallItem(text) {
  const q = text.toLowerCase();
  return INSTALL_ITEMS.find((item) => item.keywords.some((kw) => q.includes(kw)));
}
function ccFindInstallItemById(id) {
  return INSTALL_ITEMS.find((item) => item.id === id);
}

function ccStreamTerminal(container, lines, onComplete) {
  const term = document.createElement("div");
  term.className = "term";
  container.appendChild(term);
  const win = document.getElementById("cc-chat-window");
  let i = 0;
  function next() {
    if (i >= lines.length) { onComplete(); return; }
    const lineEl = document.createElement("div");
    lineEl.className = "line";
    lineEl.textContent = lines[i];
    term.appendChild(lineEl);
    win.scrollTop = win.scrollHeight;
    i++;
    setTimeout(next, 280);
  }
  next();
}

// Ties a completed "install" back into the real Task Check list and progress bar.
function ccApplyInstallProgress(item) {
  let changed = false;
  if (item.taskKeywords) {
    TASKS.forEach((t) => {
      if (!t.done && item.taskKeywords.some((kw) => t.label.toLowerCase().includes(kw))) {
        t.done = true;
        changed = true;
      }
    });
  }
  if (item.setupKeywords) {
    SETUP_STEPS.forEach((s) => {
      if (s.status !== "done" && item.setupKeywords.some((kw) => s.name.toLowerCase().includes(kw))) {
        s.status = "done";
        changed = true;
      }
    });
  }
  if (changed) {
    ccRenderTaskCheckList();
    ccRenderProgress();
  }
}

function ccHandleInstall(item) {
  ccAppend("route", `Orchestrator → routing to <b>Setup Agent</b>…`);
  setTimeout(() => {
    if (ccInstalled.has(item.id)) {
      ccAppend("bot", `<span class="agent-tag tag-setup">Setup Agent</span><br/><b>${item.label}</b> is already installed and ready to go ✅`);
      return;
    }
    const bot = ccAppend(
      "bot",
      `<span class="agent-tag tag-setup">Setup Agent</span><br/>Ok, I'll help you set up <b>${item.label}</b>. Setting up your environment now...`
    );
    ccStreamTerminal(bot, item.log, () => {
      const doneWrap = document.createElement("div");
      doneWrap.className = "term";
      doneWrap.innerHTML = `<div class="line ok">$ verifying installation...</div><div class="line done">✓ done</div>`;
      bot.appendChild(doneWrap);
      document.getElementById("cc-chat-window").scrollTop = document.getElementById("cc-chat-window").scrollHeight;
      ccAppend("bot", `<b>Done!</b> ${item.label} is installed and ready. Anything else you haven't set up yet?`);
      ccInstalled.add(item.id);
      ccApplyInstallProgress(item);
    });
  }, 450);
}

function ccHandle(question) {
  ccAppend("user", question);

  if (INSTALL_INTENT_RE.test(question.toLowerCase())) {
    const installItem = ccFindInstallItem(question);
    if (installItem) {
      ccHandleInstall(installItem);
      return;
    }
  }

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
    "I haven't downloaded Python",
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
