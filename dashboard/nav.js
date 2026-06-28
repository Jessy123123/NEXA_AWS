// Shared top navigation, injected into every page based on <body data-page="...">.
// Also shows who's currently "logged in" (employee ID from session.js) and a way to switch.

const NAV_LINKS = [
  { id: "overview", label: "Overview", href: "index.html" },
  { id: "profile", label: "Profile Agent", href: "profile.html" },
  { id: "setup", label: "Setup Agent", href: "setup.html" },
  { id: "knowledge", label: "Knowledge Agent", href: "knowledge.html" },
  { id: "communication", label: "Communication Agent", href: "communication.html" },
  { id: "tasks", label: "Daily Task Agent", href: "tasks.html" },
];

function renderNav() {
  const current = document.body.dataset.page;
  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.innerHTML = NAV_LINKS.map(
    (link) => `<a href="${link.href}" class="${link.id === current ? "active" : ""}">${link.label}</a>`
  ).join("");
  document.querySelector(".topbar").appendChild(nav);
}

async function renderSessionChip() {
  const employeeId = getEmployeeId();
  if (!employeeId) return;
  const chip = document.createElement("div");
  chip.className = "session-chip";
  chip.textContent = employeeId;
  document.querySelector(".topbar").appendChild(chip);
  try {
    const employee = await api(`/employees/${employeeId}`);
    chip.innerHTML = `${employee.name} <span class="session-dept">${employee.department}</span> <a href="#" id="switch-employee">Switch</a>`;
    document.getElementById("switch-employee").addEventListener("click", (e) => {
      e.preventDefault();
      clearEmployeeId();
      window.location.href = "index.html";
    });
  } catch (err) {
    chip.textContent = employeeId + " (unverified)";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderSessionChip();
});
