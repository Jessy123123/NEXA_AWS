// Shared top navigation, injected into every page based on <body data-page="...">.

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

document.addEventListener("DOMContentLoaded", renderNav);
