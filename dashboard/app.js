// Prototype wiring — no backend calls, all mock data from data.js.

function renderProfile() {
  const name = document.getElementById("emp-name");
  if (!name) return;
  name.textContent = EMPLOYEE.name;
  document.getElementById("emp-title").textContent = EMPLOYEE.title;
  document.getElementById("emp-meta").textContent = EMPLOYEE.meta;
}

function renderOrgChart() {
  const root = document.getElementById("orgchart");
  if (!root) return;
  root.innerHTML = "";
  ORG_CHART.forEach((person) => {
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

function renderTaskItem(item, listId, onToggle) {
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
    li.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      li.classList.toggle("completed", item.done);
    });
  }
  list.appendChild(li);
}

function renderTasksPanel() {
  if (!document.getElementById("tasks-list")) return;
  TASKS.forEach((t) => renderTaskItem(t, "tasks-list", true));
  INCIDENTS.forEach((i) => renderTaskItem(i, "incidents-list", false));
  TRAINING.forEach((t) => renderTaskItem(t, "training-list", false));
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

function findKbAnswer(question) {
  const q = question.toLowerCase();
  return KB_ANSWERS.find((entry) => entry.keywords.some((kw) => q.includes(kw)));
}

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
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const question = input.value.trim();
    if (!question) return;
    appendChatMessage("user", question);
    input.value = "";

    setTimeout(() => {
      const hit = findKbAnswer(question);
      if (hit) {
        appendChatMessage(
          "bot",
          `${hit.answer}<span class="citation">Source: ${hit.source.title} (${hit.source.category})</span>`
        );
      } else {
        appendChatMessage(
          "bot",
          `I couldn't find a confident answer in the knowledge base for that — try rephrasing, or check the FAQ section below.`
        );
      }
    }, 500);
  });
}

function renderFaq(filter = "") {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = "";
  FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(filter.toLowerCase()) ||
      f.category.toLowerCase().includes(filter.toLowerCase())
  ).forEach((f) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `
      <div class="faq-q"><span><span class="faq-cat">${f.category}</span>${f.q}</span><span>+</span></div>
      <div class="faq-a">${f.a}</div>
    `;
    item.querySelector(".faq-q").addEventListener("click", () => item.classList.toggle("open"));
    list.appendChild(item);
  });
}

function setupFaqSearch() {
  const search = document.getElementById("faq-search");
  if (!search) return;
  search.addEventListener("input", (e) => renderFaq(e.target.value));
}

function setupFaqCategoryChips() {
  const row = document.getElementById("faq-categories");
  if (!row) return;
  const categories = ["All", ...new Set(FAQS.map((f) => f.category))];
  row.innerHTML = categories
    .map((c, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  row.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderFaq(chip.dataset.cat === "All" ? "" : chip.dataset.cat);
    });
  });
}

function renderSetupSteps() {
  const root = document.getElementById("setup-steps");
  if (!root) return;
  root.innerHTML = "";
  const doneCount = SETUP_STEPS.filter((s) => s.status === "done").length;
  const pct = Math.round((doneCount / SETUP_STEPS.length) * 100);
  const fill = document.getElementById("progress-fill");
  if (fill) {
    fill.style.width = pct + "%";
    fill.textContent = pct + "%";
  }
  SETUP_STEPS.forEach((step) => {
    const div = document.createElement("div");
    div.className = "step-detail " + step.status;
    div.innerHTML = `
      <div class="step-name">${step.status === "done" ? "✓" : step.status === "active" ? "●" : "○"} ${step.name}</div>
      <div class="step-meta">${step.system} — ${step.detail}</div>
    `;
    root.appendChild(div);
  });
}

function renderCommunications() {
  const list = document.getElementById("comm-list");
  if (!list) return;
  list.innerHTML = "";
  COMMUNICATIONS.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="channel">${c.channel}</span>
      <span class="subject">${c.subject}<br/><span class="recipient">${c.recipient} · ${c.time}</span></span>
      <span class="comm-status ${c.status}">${c.status}</span>
    `;
    list.appendChild(li);
  });
}

function renderOverview() {
  const root = document.getElementById("overview-grid");
  if (!root) return;
  const doneCount = SETUP_STEPS.filter((s) => s.status === "done").length;
  const setupPct = Math.round((doneCount / SETUP_STEPS.length) * 100);
  const tasksDone = TASKS.filter((t) => t.done).length;
  const tasksPct = Math.round((tasksDone / TASKS.length) * 100);
  const overall = Math.round((setupPct + tasksPct) / 2);
  const openTasks = TASKS.filter((t) => !t.done).length;
  const commsSent = COMMUNICATIONS.filter((c) => c.status === "Sent").length;

  const hero = document.getElementById("ov-hero");
  if (hero) {
    hero.innerHTML = `
      <div>
        <div class="ov-pct">${overall}%</div>
        <div class="ov-pct-label">Onboarding complete</div>
      </div>
      <div class="ov-hero-mid">
        <div class="ov-sub">${EMPLOYEE.name} · ${EMPLOYEE.title}</div>
        <div class="ov-bar"><div style="width:${overall}%"></div></div>
        <div class="ov-stats">
          <div><div class="n">${setupPct}%</div><div class="l">IT Setup</div></div>
          <div><div class="n">${openTasks}</div><div class="l">Open tasks</div></div>
          <div><div class="n">${commsSent}</div><div class="l">Messages sent</div></div>
        </div>
      </div>
      <a class="ov-cta" href="command.html">Open Command Center →</a>`;
  }

  const cards = [
    { label: "Profile Agent", href: "profile.html", ico: "\u{1F464}", h: EMPLOYEE.name, p: EMPLOYEE.title },
    { label: "Setup Agent", href: "setup.html", ico: "⚙️", h: setupPct + "% complete", p: `${doneCount}/${SETUP_STEPS.length} provisioning steps done` },
    { label: "Knowledge Agent", href: "knowledge.html", ico: "\u{1F4DA}", h: KB_ANSWERS.length + " topics indexed", p: "Ask IT, HR, Security, Finance questions" },
    { label: "Communication Agent", href: "communication.html", ico: "✉️", h: COMMUNICATIONS.length + " messages", p: `${commsSent} sent · welcome, manager, Teams, calendar` },
    { label: "Daily Task Agent", href: "tasks.html", ico: "✅", h: openTasks + " tasks open", p: `${INCIDENTS.length} incidents, ${TRAINING.length} trainings due` },
  ];
  root.innerHTML = cards
    .map(
      (c) => `
      <a class="agent-card" href="${c.href}">
        <div class="ov-ico">${c.ico}</div>
        <div class="agent-label">${c.label}</div>
        <div class="stat">${c.h}</div>
        <p>${c.p}</p>
        <span class="ov-view">View details →</span>
      </a>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  renderOrgChart();
  renderTasksPanel();
  setupTabs();
  setupChat();
  renderFaq();
  setupFaqSearch();
  setupFaqCategoryChips();
  renderSetupSteps();
  renderCommunications();
  renderOverview();
});
