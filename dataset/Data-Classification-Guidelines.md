# Data Classification Guidelines
**Document ID:** POL-IT-DC-002  
**Version:** 2.0  
**Effective Date:** 1 February 2026  
**Classification:** Internal Use Only  
**Owner:** IT Security Department, TechVenture Sdn Bhd  
**Approved By:** Azman Ismail, VP Engineering & CISO  
**Related Policy:** IT Security Policy v2.3 (POL-IT-SEC-001)

---

## 1. Purpose

These guidelines define the data classification framework for TechVenture Sdn Bhd. All data created, processed, stored, or transmitted by the company must be classified according to this framework to ensure appropriate handling, protection, and access controls.

---

## 2. Classification Levels

TechVenture uses a four-tier data classification system:

| Level | Label | Description | Colour Code |
|---|---|---|---|
| 1 | **Public** | Information approved for public disclosure | 🟢 Green |
| 2 | **Internal Use Only** | General business information for internal audiences | 🔵 Blue |
| 3 | **Confidential** | Sensitive business information with restricted access | 🟡 Amber |
| 4 | **Restricted** | Highly sensitive data requiring maximum protection | 🔴 Red |

---

## 3. Classification Definitions and Examples

### 3.1 Public (Level 1)

**Definition:** Information that has been explicitly approved for public disclosure and whose release poses no risk to the company.

**Examples:**
- Published marketing materials and press releases
- Public-facing website content
- Published API documentation
- Open-source code repositories
- Job postings and public company information
- Published financial reports (after filing)

**Default Owner:** Marketing/Communications team (for approval of public release)

### 3.2 Internal Use Only (Level 2)

**Definition:** General business information intended for internal audiences. Disclosure outside the company would not cause significant harm but is not intended for public consumption.

**Examples:**
- Internal announcements and newsletters
- Organisation charts and department structures
- General meeting notes (non-sensitive)
- Internal process documentation and SOPs
- Training materials (non-proprietary)
- Vendor lists and general procurement information
- Internal project status reports
- Office policies (dress code, office hours, etc.)

**Default Owner:** Creating department head

### 3.3 Confidential (Level 3)

**Definition:** Sensitive business information whose unauthorised disclosure could harm the company's competitive position, reputation, or financial standing.

**Examples:**
- Financial data (budgets, forecasts, unaudited results)
- Customer lists and pricing agreements
- Product roadmaps and unreleased feature plans
- Strategic planning documents
- Employee compensation data
- Sales pipeline and deal information
- Partnership and vendor contract terms
- Board meeting minutes
- Audit reports
- Customer usage analytics and behavioural data
- Source code (proprietary, non-open-source)
- Security architecture documents
- Incident reports

**Default Owner:** Department Head + IT Security (joint responsibility)

### 3.4 Restricted (Level 4)

**Definition:** Highly sensitive data whose unauthorised disclosure would cause severe harm to the company, its customers, or individuals. Includes data protected by law or regulation.

**Examples:**
- Personal Data (as defined by PDPA 2010): IC numbers, addresses, biometric data
- Customer financial data (payment card numbers, bank accounts)
- Employee medical records
- Authentication credentials and secrets (API keys, passwords, certificates)
- Encryption keys and certificates
- Legal hold documents and litigation materials
- M&A related documents (pre-announcement)
- Penetration test results
- Security vulnerability details (pre-patch)
- Executive compensation and equity details
- Customer data subject to NDA

**Default Owner:** Data owner must be explicitly designated; IT Security maintains oversight

---

## 4. Handling Requirements

### 4.1 Storage

| Level | Storage Requirements |
|---|---|
| Public | Any approved company system |
| Internal Use Only | Company-approved systems (OneDrive, SharePoint, Confluence) |
| Confidential | Encrypted storage, access-controlled repositories, no personal devices |
| Restricted | Encrypted at rest (AES-256), dedicated access-controlled systems, no cloud storage without explicit approval, DLP-monitored |

### 4.2 Transmission

| Level | Transmission Requirements |
|---|---|
| Public | Any channel |
| Internal Use Only | Company email, Teams, Slack (internal channels) |
| Confidential | Encrypted email (TLS enforced), secure file sharing (OneDrive with access controls), no personal email |
| Restricted | End-to-end encrypted channels only, password-protected attachments, no external sharing without VP + IT Security approval |

### 4.3 Sharing and Access

| Level | Internal Sharing | External Sharing |
|---|---|---|
| Public | Unrestricted | Approved for external |
| Internal Use Only | All employees | Not permitted without manager approval |
| Confidential | Need-to-know basis, role-based access | Requires Department Head approval + NDA |
| Restricted | Named individuals only, logged access | Requires VP + Legal + IT Security approval |

### 4.4 Disposal

| Level | Disposal Method |
|---|---|
| Public | Standard deletion |
| Internal Use Only | Standard deletion, physical documents shredded |
| Confidential | Secure deletion (overwrite), physical documents cross-cut shredded |
| Restricted | Cryptographic erasure or DOD 5220.22-M standard wipe, physical documents cross-cut shredded with witnessed destruction log |

### 4.5 Printing

| Level | Printing Rules |
|---|---|
| Public | Normal printing permitted |
| Internal Use Only | Normal printing, collect promptly |
| Confidential | Secure print (PIN release) only, watermarked, collect immediately |
| Restricted | Secure print (PIN release), watermarked, numbered copies, logged, no printing without explicit approval |

---

## 5. Labelling Requirements

### 5.1 Document Labelling
All documents must display their classification level:
- **Header/Footer:** Classification label on every page
- **Email subject line:** Prefix with [CONFIDENTIAL] or [RESTRICTED] for Levels 3-4
- **File naming:** Include classification in filename for Levels 3-4 (e.g., "Budget-2026-CONFIDENTIAL.xlsx")
- **Digital labels:** Use Microsoft Information Protection labels in Office 365

### 5.2 System Labelling
- Databases containing Restricted data must be tagged in the asset inventory
- Cloud storage containers (S3 buckets, SharePoint sites) must have classification tags
- API endpoints serving Confidential/Restricted data must be documented in the API registry

### 5.3 Physical Labelling
- Physical storage (filing cabinets, safes) labelled with highest classification level contained
- Meeting rooms: Whiteboard content classified as per discussion — erase boards after Confidential/Restricted discussions

---

## 6. Classification Process

### 6.1 Who Classifies?
- **Data creator** assigns initial classification at time of creation
- **Data owner** (typically department head) validates and may upgrade classification
- **IT Security** may upgrade classification if risk assessment warrants it
- **No one may downgrade** classification without IT Security approval

### 6.2 Classification Decision Matrix

When uncertain about classification level, use this decision matrix:

| Question | If Yes → |
|---|---|
| Would disclosure harm individuals (privacy, safety)? | Restricted |
| Is it protected by law or regulation (PDPA, contractual NDA)? | Restricted |
| Would disclosure cause financial loss >RM 100K? | Confidential or Restricted |
| Would disclosure damage competitive position? | Confidential |
| Would disclosure embarrass the company publicly? | Confidential |
| Is it general business information? | Internal Use Only |
| Has it been explicitly approved for public release? | Public |

**When in doubt, classify one level higher and request review.**

### 6.3 Reclassification
- Data may be reclassified when circumstances change (e.g., product launched → roadmap becomes Internal)
- Reclassification requests submitted to IT Security
- Downgrade requires IT Security sign-off
- Upgrade can be done by data owner immediately

---

## 7. Special Data Categories

### 7.1 Personal Data (PDPA 2010 Compliance)
Under the Malaysian Personal Data Protection Act 2010, the following are classified as **Restricted** by default:
- Full name combined with IC/passport number
- Financial information (bank accounts, credit card numbers)
- Health/medical information
- Biometric data
- Political opinions, religious beliefs
- Criminal records

**Additional Requirements:**
- Personal data processing requires valid consent or lawful basis
- Data Protection Impact Assessment (DPIA) required for new processing activities
- Cross-border transfer requires compliance with Section 129 of PDPA
- Data breach notification to Commissioner within 72 hours

### 7.2 Payment Card Data (PCI DSS)
- Cardholder data is always **Restricted**
- Full PAN must never be stored in readable form
- CVV/CVC must never be stored post-authorisation
- Cardholder Data Environment (CDE) has additional network segmentation requirements
- Annual PCI DSS assessment required

### 7.3 Intellectual Property
- Patents (filed): Confidential until published
- Trade secrets: Restricted
- Source code: Confidential (minimum); Restricted if containing security-critical logic
- Algorithms and models (proprietary): Confidential

---

## 8. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| All Employees | Classify data they create, handle data per guidelines, report misclassification |
| Data Owners | Validate classification, approve access requests, conduct periodic reviews |
| Department Heads | Ensure team compliance, approve external sharing of Confidential data |
| IT Security | Maintain framework, conduct audits, approve reclassification, investigate violations |
| IT Operations | Implement technical controls (encryption, DLP, access controls) |
| Legal | Advise on regulatory classification requirements, approve Restricted external sharing |
| HR | Ensure training completion, handle violation escalations |

---

## 9. Violations

Classification violations are handled per the IT Security Policy (POL-IT-SEC-001, Section 10):
- Accidental misclassification (first occurrence): Coaching and retraining
- Repeated misclassification: Written warning
- Intentional mishandling of Confidential data: Suspension pending investigation
- Intentional mishandling of Restricted data: Termination and potential legal action
- Data breach resulting from classification failure: Incident response process activated

---

## 10. Training

- All new employees must complete Data Classification training within first 5 business days
- Annual refresher training required (via LMS)
- Quarterly phishing simulations include data handling scenarios
- Managers receive additional training on approval workflows

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 1 Jan 2024 | IT Security Team | Initial guidelines |
| 1.1 | 1 Jul 2024 | IT Security Team | Added PCI DSS section |
| 1.2 | 1 Jan 2025 | Azman Ismail | Updated PDPA requirements |
| 2.0 | 1 Feb 2026 | IT Security Team | Major revision — added handling matrix, decision framework, special categories |

---
*End of Document*
