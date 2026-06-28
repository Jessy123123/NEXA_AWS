// Grounded in TechVenture Sdn Bhd's actual knowledge-base documents
// (dataset/*.md — the same 11 files seeded into the awsiq-knowledge-base S3 bucket).
// This prototype runs the "RAG" lookup client-side against a small extract of
// that real content, standing in for a live Bedrock Knowledge Base query.

const EMPLOYEE = {
  name: "Aisha Rahman",
  title: "Software Engineer, Platform Team",
  meta: "Kuala Lumpur · Started 2026-06-29 · Manager: Sarah Tan",
};

const ORG_CHART = [
  { id: "vp", name: "Azman Ismail", role: "VP Engineering & CISO", email: "azman.ismail@techventure.com.my", teams: "azman.ismail" },
  { id: "mgr", name: "Sarah Tan", role: "Engineering Lead", email: "sarah.tan@techventure.com.my", teams: "sarah.tan" },
  { id: "me", name: "Aisha Rahman", role: "Software Engineer (You)", email: "aisha.rahman@techventure.com.my", teams: "aisha.rahman", me: true },
  { id: "peer1", name: "Rajesh Kumar", role: "Backend Developer", email: "rajesh.kumar@techventure.com.my", teams: "rajesh.kumar" },
  { id: "peer2", name: "Mei Ling", role: "Frontend Developer", email: "mei.ling@techventure.com.my", teams: "mei.ling" },
  { id: "devops", name: "David Lim", role: "DevOps Lead", email: "david.lim@techventure.com.my", teams: "david.lim" },
];

// Mirrors the Employee-Onboarding-Checklist.md Day-1 self-service list (Section 3.3)
// and the role-specific Day 2-5 engineering path (Section 4.2).
const TASKS = [
  { id: "t1", label: "Return signed employment contract to HR", priority: "High", done: true },
  { id: "t2", label: "Configure MFA (YubiKey + authenticator app)", priority: "High", done: false },
  { id: "t3", label: "Test VPN connectivity (Cisco AnyConnect)", priority: "High", done: false },
  { id: "t4", label: "Complete Security Awareness Module 1 (LMS)", priority: "Medium", done: false },
  { id: "t5", label: "Dev environment setup — IDE, local DB, Docker", priority: "Medium", done: false },
  { id: "t6", label: "Initiate benefits enrollment (deadline: Day 14)", priority: "Low", done: false },
];

// Reflects access-provisioning timeline gaps from Section 8 of the onboarding checklist.
const INCIDENTS = [
  { id: "i1", label: "Code repo write access pending security training completion", priority: "Medium" },
  { id: "i2", label: "Okta SSO enrollment not yet confirmed by IT Operations", priority: "Low" },
];

// First-week mandatory training schedule, Section 4.1 of the onboarding checklist.
const TRAINING = [
  { id: "tr1", label: "Data Classification Guidelines (45 min, due Day 2)", priority: "High" },
  { id: "tr2", label: "PDPA & Data Privacy Basics (60 min, due Day 5)", priority: "High" },
  { id: "tr3", label: "Anti-Bribery & Corruption / MACC Act (30 min, due Day 5)", priority: "Medium" },
  { id: "tr4", label: "Code of Conduct & Ethics (45 min, due Day 5)", priority: "Medium" },
];

const FAQS = [
  {
    category: "IT Setup",
    q: "How do I get VPN access set up?",
    a: "VPN accounts are created by IT Operations 2 days before your start date via Cisco AnyConnect. Full access activates on Day 1 once MFA (YubiKey + authenticator app) is configured. (Employee-Onboarding-Checklist.md, §2.2 & §8)",
  },
  {
    category: "IT Setup",
    q: "When do I get write access to code repositories?",
    a: "Read access to code repositories is granted Day 2. Write access is granted Day 5, after you've completed mandatory security training. (Employee-Onboarding-Checklist.md, §8)",
  },
  {
    category: "Security",
    q: "What's the minimum password requirement?",
    a: "Minimum 14 characters with uppercase, lowercase, numeric, and special characters. Privileged accounts rotate every 90 days; standard accounts every 180 days. You can't reuse your last 12 passwords. (IT-Security-Policy-v2.3.md, §2.2)",
  },
  {
    category: "Security",
    q: "How is sensitive data classified at TechVenture?",
    a: "Four tiers: Public, Internal Use Only, Confidential, and Restricted. Personal data under PDPA (IC numbers, biometric data) is Restricted by default. When unsure, classify one level higher and request review. (Data-Classification-Guidelines.md, §2 & §6.2)",
  },
  {
    category: "Benefits",
    q: "When does benefits enrollment need to happen?",
    a: "Benefits enrollment briefing happens on Day 1; enrollment itself must be completed by Day 14. (Employee-Onboarding-Checklist.md, §3.3 & §5)",
  },
  {
    category: "Travel & Expense",
    q: "What's the meal allowance if I travel to Singapore?",
    a: "SGD 20 breakfast, SGD 30 lunch, SGD 50 dinner — SGD 100/day total. Meals provided by a hotel, client, or event are deducted from the per diem. (Travel-Expense-SOP.md, §5.1)",
  },
  {
    category: "Travel & Expense",
    q: "How long do I have to submit an expense claim?",
    a: "Within 14 calendar days of trip completion. Claims after 30 days need Finance Manager approval; after 60 days they're rejected with no exceptions. (Travel-Expense-SOP.md, §6.1)",
  },
  {
    category: "Getting Started",
    q: "What should I expect on Day 1?",
    a: "Morning: welcome/orientation, IT equipment handover, account activation, company overview, benefits briefing, and meeting your buddy. Afternoon: team intro, Security Awareness Module 1, tool walkthrough, and a 1:1 with your manager on 30-day goals. (Employee-Onboarding-Checklist.md, §3.1-3.2)",
  },
];

// Setup Agent — provisioning workflow steps (Employee-Onboarding-Checklist.md, §2.2)
const SETUP_STEPS = [
  { name: "VPN Access", system: "Cisco AnyConnect", status: "done", detail: "Account created T-2 days. Full access activates after MFA setup." },
  { name: "Email Account", system: "Microsoft 365 / Azure AD", status: "done", detail: "Provisioned T-3 days, accessible from Day 1." },
  { name: "SharePoint Access", system: "Microsoft 365", status: "done", detail: "Linked to Platform Team site, Day 1 access confirmed." },
  { name: "Workday / Okta SSO", system: "Okta", status: "active", detail: "SSO account created T-3 days; enrollment confirmation pending from IT Operations." },
  { name: "Software Installation", system: "SCCM / Intune", status: "pending", detail: "IDE, Docker, and engineering toolchain queued for push." },
];

// Communication Agent — log of automated notifications (design.md §5, Communication Agent)
const COMMUNICATIONS = [
  { channel: "Email", subject: "Welcome to TechVenture, Aisha!", recipient: "aisha.rahman@techventure.com.my", status: "Sent", time: "2026-06-29 08:02" },
  { channel: "Email", subject: "New hire starting today — Aisha Rahman", recipient: "sarah.tan@techventure.com.my (Manager)", status: "Sent", time: "2026-06-29 08:02" },
  { channel: "Teams", subject: "Onboarding started for Aisha Rahman", recipient: "#platform-team", status: "Sent", time: "2026-06-29 08:03" },
  { channel: "Calendar", subject: "Manager briefing: Aisha Rahman 30-day goals", recipient: "sarah.tan@techventure.com.my", status: "Sent", time: "2026-06-29 08:05" },
  { channel: "Email", subject: "Milestone: Day 1 IT setup 60% complete", recipient: "aisha.rahman@techventure.com.my", status: "Retrying", time: "2026-06-29 14:30" },
  { channel: "Teams", subject: "Benefits enrollment reminder (due Day 14)", recipient: "aisha.rahman@techventure.com.my", status: "Sent", time: "2026-06-29 09:00" },
];

// Simulates the Knowledge Agent's retrieval step: keyword match → real document chunk → citation.
const KB_ANSWERS = [
  {
    keywords: ["vpn"],
    answer: "VPN access uses Cisco AnyConnect with MFA + certificate, 12-hour session timeout. Your account is created 2 days before start, but full access only activates after you configure MFA on Day 1.",
    source: { title: "IT Security Policy v2.3, §2.1", category: "Security" },
  },
  {
    keywords: ["password"],
    answer: "Minimum 14 characters, must include uppercase, lowercase, numeric, and special characters. Privileged accounts rotate every 90 days, standard accounts every 180 days. 5 failed attempts triggers a 30-minute lockout.",
    source: { title: "IT Security Policy v2.3, §2.2", category: "Security" },
  },
  {
    keywords: ["classif", "restricted", "confidential", "pdpa"],
    answer: "Data is classified into 4 tiers: Public, Internal Use Only, Confidential, Restricted. Personal data under Malaysia's PDPA 2010 (IC numbers, biometric data) is Restricted by default, and breach notification to the Commissioner is required within 72 hours.",
    source: { title: "Data Classification Guidelines, §2 & §7.1", category: "Security" },
  },
  {
    keywords: ["expense", "reimburs", "claim"],
    answer: "Expense claims must be submitted via SAP Concur within 14 calendar days of trip completion. Required documentation varies by type — e.g. itemised hotel folio for hotels, app receipt for Grab rides.",
    source: { title: "Travel-Expense-SOP.md, §6.1 & §6.2", category: "Finance" },
  },
  {
    keywords: ["per diem", "meal", "allowance", "singapore", "travel"],
    answer: "Meal per diem depends on destination — e.g. RM 80/day within KL/Selangor, SGD 100/day in Singapore. Meals already covered by a hotel or client are deducted from your allowance.",
    source: { title: "Travel-Expense-SOP.md, §5.1", category: "Finance" },
  },
  {
    keywords: ["onboard", "day 1", "first day", "checklist"],
    answer: "Day 1 covers orientation, IT equipment handover, account activation, a company overview, and a benefits briefing in the morning — then team intro, your first security training module, and a 1:1 with your manager in the afternoon.",
    source: { title: "Employee-Onboarding-Checklist.md, §3", category: "HR" },
  },
  {
    keywords: ["repo", "github", "write access", "code access"],
    answer: "Code repository read access is granted Day 2. Write access follows on Day 5, gated on completing your mandatory security training.",
    source: { title: "Employee-Onboarding-Checklist.md, §8", category: "IT" },
  },
  {
    keywords: ["incident", "breach", "severity"],
    answer: "Security incidents are triaged SEV-1 (critical, 15-min response, escalates to VP Eng + CEO) through SEV-4 (low, 24-hour response). All incidents are logged in ServiceNow within 1 hour of detection.",
    source: { title: "IT Security Policy v2.3, §6.1-6.2", category: "Security" },
  },
];
