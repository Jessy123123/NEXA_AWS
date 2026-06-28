# AWS × UTP GenAI Hackathon 2026 — Dataset

## Overview

This dataset provides realistic mock enterprise data for the AWS × UTP GenAI Hackathon 2026. All data is fictional, based on a Malaysian technology company context (**TechVenture Sdn Bhd** — a mid-size SaaS company based in Kuala Lumpur).

The dataset covers **3 challenge statements**, each requiring different GenAI capabilities.

---

## Challenge 1: Meeting Intelligence

**Objective:** Build a GenAI solution that can extract actionable insights from meeting transcripts — action items, decisions, owners, deadlines, and key discussion points.

### Files

| File | Description |
|---|---|
| `weekly-standup-2026-06-02.md` | Weekly project standup with technical updates, blockers, and coordination items |
| `budget-review-2026-05-28.md` | Budget review meeting with financial decisions, approvals, and conditions |
| `cross-team-planning-2026-06-05.md` | Cross-team planning session with complex dependencies between Platform and Mobile teams |
| `incident-postmortem-2026-06-09.md` | Post-incident review with root cause analysis, remediation actions, and severity assessment |

### Format
- Speaker-tagged: `[Name - Role]`
- Timestamped: `[HH:MM]`
- Natural conversation flow — action items and decisions are embedded in dialogue, not bullet-pointed
- Realistic patterns: interruptions, follow-ups, cross-references, conditional decisions

### Suggested Extraction Targets
- Action items (what, who, when)
- Decisions made (with conditions/constraints)
- Blockers and dependencies
- Key metrics and numbers mentioned
- Follow-up meetings scheduled
- Risks identified

---

## Challenge 2: Enterprise Document Q&A

**Objective:** Build a GenAI-powered Q&A system that can answer questions from enterprise documents accurately, with source attribution and section references.

### Files

| File | Description |
|---|---|
| `IT-Security-Policy-v2.3.md` | Comprehensive IT security policy with 10 sections covering access control, encryption, incident response, and compliance |
| `Travel-Expense-SOP.md` | Standard operating procedure for travel and expenses with limits, approval matrices, and process flows |
| `Cloud-Migration-Strategy-2026.md` | Strategic document with executive summary, phases, budget, risks, and governance |
| `QBR-Q1-2026-Summary.md` | Quarterly business review with financials, KPIs, highlights, and concerns |
| `Data-Classification-Guidelines.md` | Data classification framework with 4 levels, handling rules, and decision matrices |
| `Employee-Onboarding-Checklist.md` | Onboarding process with IT provisioning, training schedules, and milestone tracking |

### Format
- Professional enterprise document structure with numbered sections
- Tables, lists, and hierarchical headings
- Cross-references between documents
- Specific numbers, dates, names, and thresholds suitable for factual Q&A
- Document metadata (version, owner, classification, effective date)

### Suggested Q&A Examples
- "What is the password rotation policy for privileged accounts?"
- "What is the daily meal allowance for travel to Singapore?"
- "What phase is the cloud migration currently in?"
- "What was the Q1 2026 revenue and how did it compare to target?"
- "How should Restricted data be disposed of?"
- "When does a new engineering hire get write access to code repositories?"

---

## Challenge 3: Process Workflow Tracker

**Objective:** Build a GenAI solution that can parse unstructured workflow communications and reconstruct process status, identify bottlenecks, track dependencies, and provide project health summaries.

### Files

| File | Description |
|---|---|
| `workflow-messages.csv` | 50+ simulated messages across multiple projects with natural workflow signals |

### CSV Schema

| Column | Description |
|---|---|
| `timestamp` | ISO format datetime (2026-05-19 to 2026-06-11) |
| `sender` | Person identifier (email or username) |
| `channel` | Communication channel: `email`, `chat`, `ticket_update` |
| `subject` | Message subject/topic |
| `body` | Full message content with natural workflow language |
| `project` | Project tag: `cloud-migration`, `mobile-app`, `reporting-module` |

### Projects Covered
1. **cloud-migration** — Infrastructure migration with vendor dependencies, approvals, and production cutovers
2. **mobile-app** — Mobile app release with cross-team API dependencies and testing phases
3. **reporting-module** — Bug fix workflow from discovery through fix and verification

### Workflow Signals Present
- Status transitions: submitted → approved → in progress → blocked → resolved → deployed
- Dependencies: "waiting on", "blocked by", "need X from Y"
- Approvals: "approved", "signed off", "Legal approved"
- Escalations: "escalating to", "committed to deadline"
- Completions: "complete", "deployed", "verified", "all passing"
- Risks: "tight timeline", "no buffer", "blocker"

### Suggested Analysis Targets
- Reconstruct project timelines and current status
- Identify bottlenecks and blocked items
- Map dependencies between people and deliverables
- Calculate cycle times (e.g., time from bug report to fix verification)
- Generate project health dashboards
- Predict potential risks based on communication patterns

---

## Company Context

**TechVenture Sdn Bhd** is a fictional Malaysian SaaS company with:
- ~130 employees, primarily based in KL
- Products: Enterprise analytics platform, mobile app, API platform
- Tech stack: AWS, Kubernetes, React, Python, PostgreSQL
- Revenue: ~RM 35M ARR
- Stage: Growth-stage, preparing for potential IPO in 2028

### Key Personnel Referenced

| Name | Role | Appears In |
|---|---|---|
| Lim Kok Wai | CEO | QBR |
| Tan Wei Ming | CFO | Budget Review, QBR |
| Azman Ismail | VP Engineering | Budget Review, Postmortem, Cloud Strategy |
| Ali Hassan | PM - Platform | All meetings, workflow messages |
| Sarah Tan | Engineering Lead | All meetings, workflow messages |
| Rajesh Kumar | Backend Developer | Standups, workflow messages |
| Mei Ling | Frontend Developer | Standups, workflow messages |
| David Lim | DevOps Lead | All meetings, workflow messages |
| Farah Aziz | QA Lead | All meetings, workflow messages |
| Priya Nair | PM - Mobile | Cross-team planning, workflow messages |
| Hafiz Rahman | Engineering Lead - Mobile | Cross-team planning, workflow messages |
| Tan Jia Wen | Data Engineering Lead | Cross-team planning, workflow messages |
| Nurul Huda | Finance Manager | Budget Review |
| Karen Yap | Procurement | Budget Review, workflow messages |
| Lisa Ooi | Product Design Lead | Cross-team planning |

---

## Usage Notes

1. **No real data:** All content is fictional. Company names, financial figures, and personnel are invented.
2. **Interconnected:** The documents reference each other — decisions in the budget meeting appear as actions in workflow messages; tools mentioned in the security policy appear in onboarding checklists.
3. **Realistic complexity:** Documents contain ambiguity, conditional decisions, and cross-references that make extraction challenging.
4. **Malaysian context:** Currency in RM (Malaysian Ringgit), references to Malaysian regulations (PDPA, MACC Act, BNM guidelines), local business norms.

---

## License

This dataset is provided for hackathon use only. Created by the hackathon organising committee for educational and competition purposes.

---
*Generated: June 2026*
