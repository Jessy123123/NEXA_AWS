# Employee Onboarding Checklist
**Document ID:** SOP-HR-ONB-001  
**Version:** 3.1  
**Effective Date:** 1 March 2026  
**Department:** Human Resources & IT Operations  
**Owner:** Siti Aminah (HR Director), David Lim (DevOps Lead)  
**Approved By:** Lim Kok Wai (CEO)  
**Classification:** Internal Use Only

---

## 1. Purpose

This document outlines the complete onboarding process for new employees at TechVenture Sdn Bhd, covering pre-arrival preparation, Day 1 activities, first-week requirements, and 30/60/90-day milestones. It ensures consistent, secure, and welcoming onboarding for all roles.

---

## 2. Pre-Arrival (T-5 Business Days)

### 2.1 HR Actions

| # | Task | Owner | Timeline | System |
|---|---|---|---|---|
| 1 | Send offer letter and collect signed copy | HR Coordinator | T-10 days | BambooHR |
| 2 | Initiate background check | HR Coordinator | T-10 days | Sterling |
| 3 | Send welcome email with Day 1 logistics | HR Coordinator | T-5 days | Email |
| 4 | Prepare employee file and contracts | HR Manager | T-5 days | BambooHR |
| 5 | Add to payroll system | Finance | T-3 days | SAP |
| 6 | Assign buddy/mentor from same team | Hiring Manager | T-5 days | Email |
| 7 | Schedule orientation sessions | HR Coordinator | T-5 days | Calendar |
| 8 | Order welcome kit (laptop bag, notebook, company swag) | Office Admin | T-5 days | Procurement |
| 9 | Prepare workspace/desk assignment (if office-based) | Office Admin | T-3 days | Facilities |
| 10 | Send pre-reading materials (handbook, org chart) | HR Coordinator | T-3 days | Email/SharePoint |

### 2.2 IT Provisioning

| # | Task | Owner | Timeline | System |
|---|---|---|---|---|
| 1 | Create Microsoft 365 account (email, Teams, OneDrive) | IT Operations | T-3 days | Azure AD |
| 2 | Create Okta SSO account | IT Operations | T-3 days | Okta |
| 3 | Configure laptop (Windows/Mac per role) | IT Operations | T-3 days | Intune/JAMF |
| 4 | Install required software suite | IT Operations | T-2 days | SCCM |
| 5 | Create VPN account | IT Operations | T-2 days | Cisco AnyConnect |
| 6 | Issue YubiKey (hardware MFA token) | IT Security | T-1 day | Asset Management |
| 7 | Pre-configure Slack workspace access | IT Operations | T-1 day | Slack Admin |
| 8 | Set up phone extension (if applicable) | IT Operations | T-1 day | Teams Phone |

### 2.3 Role-Specific IT Setup

| Role Category | Additional Access | Approval Required |
|---|---|---|
| Engineering | GitHub, AWS Console (dev), Jira, Confluence, IDE licenses | Engineering Lead |
| Product/Design | Figma, Jira, Confluence, Analytics tools | PM Lead |
| Sales/Marketing | Salesforce CRM, HubSpot, LinkedIn Sales Navigator | VP Sales |
| Finance | SAP access, Banking portals (view-only initially) | CFO |
| Customer Success | Zendesk, CRM (Salesforce), Product analytics | CS Lead |
| All Staff | Microsoft 365, Slack, BambooHR (self-service), LMS | Auto-provisioned |

---

## 3. Day 1

### 3.1 Morning Schedule (9:00 AM – 12:30 PM)

| Time | Activity | Location | Led By |
|---|---|---|---|
| 9:00 – 9:30 | Welcome & building tour / virtual orientation | Lobby/Teams | HR Coordinator |
| 9:30 – 10:00 | IT equipment handover & setup assistance | IT Desk/Shipped | IT Operations |
| 10:00 – 10:30 | Account activation (email, SSO, MFA setup) | Desk/Home | Self (with IT support) |
| 10:30 – 11:30 | Company overview presentation | Meeting Room/Teams | HR Director |
| 11:30 – 12:00 | Benefits enrollment briefing | Meeting Room/Teams | HR Coordinator |
| 12:00 – 12:30 | Meet your buddy — introduction and lunch planning | Desk/Teams | Assigned Buddy |

### 3.2 Afternoon Schedule (2:00 PM – 5:30 PM)

| Time | Activity | Location | Led By |
|---|---|---|---|
| 2:00 – 2:30 | Team introduction with hiring manager | Team Area/Teams | Hiring Manager |
| 2:30 – 3:30 | Mandatory compliance training (Security Awareness — Module 1) | Desk/Home | Self (LMS) |
| 3:30 – 4:00 | Tool walkthrough (Teams, Slack, Jira basics) | Desk/Home | Buddy |
| 4:00 – 4:30 | 1:1 with hiring manager (expectations, 30-day goals) | Manager's office/Teams | Hiring Manager |
| 4:30 – 5:00 | Self-guided: Review team documentation, explore tools | Desk/Home | Self |
| 5:00 – 5:30 | End-of-day check-in with buddy | Informal | Buddy |

### 3.3 Day 1 Checklist (Employee Self-Service)

- [ ] Signed employment contract returned to HR
- [ ] Emergency contact form completed in BambooHR
- [ ] Bank details submitted for payroll
- [ ] Company email accessible and tested
- [ ] Slack workspace joined, profile completed (photo + title)
- [ ] MFA (YubiKey + authenticator app) configured
- [ ] VPN connectivity tested
- [ ] Security Awareness Module 1 completed
- [ ] Building access card / VPN token received
- [ ] Benefits enrollment initiated (deadline: Day 14)

---

## 4. First Week (Days 2-5)

### 4.1 Mandatory Training Schedule

| Day | Training | Duration | Platform | Deadline |
|---|---|---|---|---|
| Day 2 | Data Classification Guidelines | 45 min | LMS | Day 2 |
| Day 2 | Acceptable Use Policy acknowledgment | 15 min | LMS | Day 2 |
| Day 3 | PDPA & Data Privacy Basics | 60 min | LMS | Day 5 |
| Day 3 | Anti-Bribery & Corruption (MACC Act) | 30 min | LMS | Day 5 |
| Day 4 | Code of Conduct & Ethics | 45 min | LMS | Day 5 |
| Day 5 | Workplace Safety (physical + ergonomics) | 30 min | LMS | Day 5 |

### 4.2 Role-Specific Onboarding

**Engineering Team:**
| Day | Activity | Led By |
|---|---|---|
| Day 2 | Development environment setup (IDE, local DB, Docker) | Senior Engineer |
| Day 2 | Code repository access and branching strategy walkthrough | Engineering Lead |
| Day 3 | Architecture overview and system design session | Engineering Lead |
| Day 3 | First "good first issue" assigned in Jira | Buddy |
| Day 4 | CI/CD pipeline walkthrough | DevOps Lead |
| Day 4 | Security coding practices briefing | IT Security |
| Day 5 | Submit first pull request (guided) | Buddy |

**Sales Team:**
| Day | Activity | Led By |
|---|---|---|
| Day 2 | CRM (Salesforce) training | Sales Ops |
| Day 2 | Product knowledge session 1 (platform overview) | Product Team |
| Day 3 | Sales playbook and methodology training | VP Sales |
| Day 3 | Shadow: observe senior AE customer call | Buddy |
| Day 4 | Product knowledge session 2 (demo preparation) | Product Team |
| Day 4 | Territory/account assignment briefing | Sales Manager |
| Day 5 | Practice demo delivery (peer feedback) | Buddy/Manager |

### 4.3 First-Week Goals

All new hires should achieve by end of Day 5:
1. All mandatory training modules completed (LMS shows 100%)
2. 1:1 scheduled with all immediate team members
3. Access to all required tools verified and working
4. First task/assignment started
5. 30-day goals documented and agreed with manager
6. Buddy relationship established with at least 2 touchpoints completed

---

## 5. 30-Day Milestones

| # | Milestone | Verification | Owner |
|---|---|---|---|
| 1 | Complete all onboarding training (LMS 100%) | LMS dashboard | New Hire |
| 2 | Benefits enrollment completed | BambooHR | New Hire |
| 3 | First meaningful deliverable completed | Manager assessment | New Hire |
| 4 | Cross-team introduction meetings (min. 3 departments) | Calendar log | New Hire |
| 5 | 30-day check-in with HR (feedback form) | HR meeting | HR Coordinator |
| 6 | 30-day check-in with manager (performance discussion) | Documented notes | Manager |
| 7 | Probation objectives clearly documented | Shared document | Manager + New Hire |
| 8 | Security training Module 2 completed | LMS | New Hire |
| 9 | Company culture session attended | Calendar | New Hire |
| 10 | Feedback provided on onboarding experience | Survey | New Hire |

---

## 6. 60-Day Milestones

| # | Milestone | Verification | Owner |
|---|---|---|---|
| 1 | Contributing independently to team deliverables | Sprint metrics / output | Manager |
| 2 | Internal knowledge base contribution (min. 1 article) | Confluence | New Hire |
| 3 | Attended at least 1 company-wide event (townhall, lunch & learn) | Attendance log | New Hire |
| 4 | 60-day manager check-in (probation progress) | Documented notes | Manager |
| 5 | Cross-functional collaboration demonstrated | Peer feedback | Manager |
| 6 | Phishing simulation response (first test) | IT Security metrics | IT Security |

---

## 7. 90-Day Milestones (Probation Review)

| # | Milestone | Verification | Owner |
|---|---|---|---|
| 1 | Probation review meeting (formal) | HR form + manager assessment | HR + Manager |
| 2 | All probation objectives met or exceeded | Documented evidence | Manager |
| 3 | 360° feedback collected (min. 3 peers, 1 stakeholder) | Feedback forms | HR |
| 4 | Confirmation letter issued (or extension/termination if applicable) | HR letter | HR Director |
| 5 | Development plan created for next 6 months | Shared document | Manager + New Hire |
| 6 | Fully autonomous in role (minimal hand-holding) | Manager assessment | Manager |

---

## 8. Access Provisioning Timeline

| System | Access Granted | Full Access After |
|---|---|---|
| Email & Calendar | Day 1 | Immediate |
| Slack & Teams | Day 1 | Immediate |
| VPN | Day 1 | After MFA setup |
| Jira / Confluence | Day 1 | Immediate |
| Code Repositories (read) | Day 2 | Day 2 |
| Code Repositories (write) | Day 5 | After security training |
| Production systems (view) | Day 14 | After manager approval |
| Production systems (modify) | Day 30 | After probation checkpoint |
| Admin/privileged access | Day 60+ | Requires IT Security + VP approval |
| Customer data access | Day 30 | After PDPA training + manager approval |
| Financial systems | Day 14 | After finance training (finance team only) |

---

## 9. Offboarding Triggers During Onboarding

If an employee does not pass probation or resigns during the onboarding period:
1. IT access revoked within 4 hours of notification
2. Hardware returned within 2 business days
3. Exit interview conducted by HR
4. Final paycheck processed per Employment Act requirements
5. NDA and non-compete obligations reinforced in exit documentation

---

## 10. Onboarding Feedback & Continuous Improvement

- **Day 7 pulse survey:** Quick 5-question satisfaction check
- **Day 30 detailed survey:** Full onboarding experience feedback
- **Quarterly HR review:** Aggregate feedback analysed, process improvements implemented
- **Buddy program feedback:** Both buddy and new hire provide mutual feedback at Day 30

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 1 Jun 2024 | HR Team | Initial checklist |
| 2.0 | 1 Oct 2024 | Siti Aminah | Added IT provisioning detail, training schedule |
| 2.1 | 1 Jan 2025 | David Lim | Added security training requirements, access timeline |
| 3.0 | 1 Sep 2025 | HR + IT | Major revision — role-specific paths, 30/60/90 milestones |
| 3.1 | 1 Mar 2026 | Siti Aminah | Updated tool list, added offboarding triggers |

---
*End of Document*
