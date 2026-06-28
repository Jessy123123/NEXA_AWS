// Shared employee-session helpers, loaded before nav.js and app.js on every page.
// The employee ID entered on index.html is the single source of "who is logged in"
// for the whole prototype — every agent page and the Orchestrator chat read it from here.

const API_BASE = "http://localhost:8000/api";
const SESSION_KEY = "awsiq_employee_id";

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function getEmployeeId() {
  return localStorage.getItem(SESSION_KEY);
}

function setEmployeeId(id) {
  localStorage.setItem(SESSION_KEY, id);
}

function clearEmployeeId() {
  localStorage.removeItem(SESSION_KEY);
}

// Pages other than index.html show this instead of their content if no employee is set.
function requireEmployeeOrRedirect() {
  if (getEmployeeId()) return true;
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `
      <div class="card wide-card" style="text-align:center; padding:48px;">
        <h3>No employee selected</h3>
        <p style="color:var(--muted)">Enter your Employee ID on the Overview page first — every agent reads from that session.</p>
        <a href="index.html"><button type="button" style="margin-top:12px;">Go to Overview</button></a>
      </div>`;
  }
  return false;
}
