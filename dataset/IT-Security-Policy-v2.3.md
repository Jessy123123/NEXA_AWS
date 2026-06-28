# IT Security Policy
**Document ID:** POL-IT-SEC-001  
**Version:** 2.3  
**Effective Date:** 1 March 2026  
**Review Date:** 1 September 2026  
**Classification:** Internal Use Only  
**Approved By:** Azman Ismail, VP Engineering & CISO  
**Approval Date:** 25 February 2026  
**Owner:** IT Security Department, TechVenture Sdn Bhd

---

## 1. Purpose and Scope

### 1.1 Purpose
This policy establishes the information security requirements for all employees, contractors, and third-party personnel who access TechVenture Sdn Bhd's information systems, networks, and data assets.

### 1.2 Scope
This policy applies to:
- All full-time and part-time employees
- Contractors and temporary staff
- Third-party vendors with system access
- All company-owned and BYOD devices accessing corporate resources
- All environments including production, staging, development, and disaster recovery

### 1.3 Related Documents
| Document | Reference |
|----------|-----------|
| Data Classification Guidelines | POL-IT-DC-002 |
| Acceptable Use Policy | POL-IT-AUP-003 |
| Incident Response Plan | POL-IT-IRP-004 |
| Business Continuity Plan | POL-IT-BCP-005 |
| Vendor Security Assessment Framework | POL-IT-VSA-006 |

---

## 2. Access Control

### 2.1 Authentication Requirements
All access to corporate systems must use multi-factor authentication (MFA). The following standards apply:

| System Type | Authentication Method | Session Timeout |
|---|---|---|
| Production systems | MFA + SSO (Okta) | 8 hours |
| Cloud console (AWS/Azure) | MFA + hardware key (YubiKey) | 4 hours |
| VPN | MFA + certificate | 12 hours |
| Email (external access) | MFA + biometric (where available) | 24 hours |
| Internal applications | SSO (Okta) | 8 hours |

### 2.2 Password Policy
- Minimum length: 14 characters
- Complexity: Must include uppercase, lowercase, numeric, and special characters
- Rotation: Every 90 days for privileged accounts, 180 days for standard accounts
- History: Cannot reuse last 12 passwords
- Lockout: 5 failed attempts triggers 30-minute lockout

### 2.3 Privileged Access Management
- All privileged access requests must be approved by the system owner AND the IT Security team
- Privileged access is granted for a maximum of 90 days and must be re-certified
- All privileged sessions must be recorded using CyberArk Privileged Session Manager
- Emergency access ("break glass") accounts exist for critical systems with mandatory post-use review within 24 hours

### 2.4 Access Reviews
- Quarterly access reviews for all production systems
- Monthly reviews for privileged accounts
- Immediate revocation upon employee termination (within 4 hours for voluntary, immediate for involuntary)
- Annual review of service accounts and API keys

---

## 3. Network Security

### 3.1 Network Segmentation
The corporate network is segmented into the following zones:

| Zone | Purpose | Access Level |
|---|---|---|
| DMZ | Public-facing services | Internet-accessible, restricted internal |
| Production | Live services and databases | Restricted to authorised engineering |
| Staging | Pre-production testing | Engineering team access |
| Development | Development environments | All engineering staff |
| Corporate | Office network, email, productivity | All employees |
| Management | Network infrastructure, security tools | IT Operations only |

### 3.2 Firewall Rules
- Default deny on all inbound traffic
- Outbound traffic filtered through web proxy with category blocking
- Inter-zone traffic requires explicit firewall rules approved by IT Security
- All firewall rule changes require change management approval (minimum 48-hour lead time except for emergency changes)

### 3.3 Remote Access
- All remote access via corporate VPN (Cisco AnyConnect) with split tunnelling disabled
- Remote access from public Wi-Fi networks must use VPN and device compliance check
- International remote access requires prior approval from IT Security (5 business days notice)

---

## 4. Data Protection

### 4.1 Encryption Standards
| Data State | Minimum Standard | Implementation |
|---|---|---|
| Data at rest | AES-256 | AWS KMS / Azure Key Vault |
| Data in transit | TLS 1.3 | Certificate managed via ACM |
| Database fields (PII) | AES-256 with field-level encryption | Application-layer encryption |
| Backups | AES-256 | Server-side encryption |
| Email (sensitive) | S/MIME or TLS enforced | Microsoft 365 OME |

### 4.2 Data Loss Prevention (DLP)
- Microsoft 365 DLP policies enforce restrictions on sharing classified data externally
- USB storage devices are blocked on all corporate endpoints
- Cloud storage sync limited to approved services (OneDrive, approved AWS S3 buckets)
- Email attachments containing PII or financial data trigger DLP review

### 4.3 Data Retention
- Production data: Retained as per contractual obligations (minimum 7 years for financial data)
- Log data: 90 days hot storage, 1 year cold storage
- Backup data: 30-day retention with weekly full backups
- Employee data: Retained 7 years post-employment as per Malaysian Employment Act

---

## 5. Endpoint Security

### 5.1 Device Requirements
All devices accessing corporate resources must have:
- Endpoint Detection and Response (EDR) — CrowdStrike Falcon
- Full disk encryption (BitLocker for Windows, FileVault for macOS)
- Automatic OS updates enabled (maximum 7-day patch deferral)
- Corporate antivirus with real-time scanning
- Mobile Device Management (MDM) for mobile devices

### 5.2 BYOD Requirements
Personal devices may access corporate email and approved SaaS applications subject to:
- MDM enrollment (Microsoft Intune)
- Device passcode/biometric enabled
- Remote wipe capability accepted
- Minimum OS version requirements (updated quarterly)
- No access to production systems or sensitive data repositories

---

## 6. Incident Response

### 6.1 Severity Levels
| Severity | Description | Response Time | Escalation |
|---|---|---|---|
| SEV-1 (Critical) | Active data breach, complete service outage | 15 minutes | VP Engineering + CEO immediately |
| SEV-2 (High) | Potential breach, significant service degradation | 30 minutes | IT Security Lead + VP Engineering |
| SEV-3 (Medium) | Security policy violation, minor vulnerability exploited | 4 hours | IT Security team |
| SEV-4 (Low) | Policy exception, minor misconfiguration | 24 hours | IT Security analyst |

### 6.2 Reporting Obligations
- Malaysian Personal Data Protection Act (PDPA) 2010: Notify Commissioner within 72 hours of confirmed personal data breach
- Customer contractual obligations: As per individual DPAs (typically 48-72 hours)
- Internal reporting: All security incidents logged in ServiceNow within 1 hour of detection

---

## 7. Security Training

### 7.1 Mandatory Training
| Training | Frequency | Audience | Completion Deadline |
|---|---|---|---|
| Security Awareness | Annual | All staff | Within 30 days of anniversary |
| Phishing Simulation | Quarterly | All staff | N/A (automatic enrollment) |
| Secure Coding | Annual | Engineering team | Within 30 days of anniversary |
| Incident Response Drill | Bi-annual | Incident responders | Scheduled by IT Security |
| Data Handling | Annual | All staff handling PII | Within 30 days of anniversary |

### 7.2 Compliance
- Training completion tracked in Learning Management System (LMS)
- Non-completion after deadline triggers system access restriction (read-only) until training is completed
- Managers receive weekly reports on team compliance status
- Repeated phishing simulation failures (3 consecutive) trigger mandatory 1:1 coaching session

---

## 8. Third-Party Security

### 8.1 Vendor Assessment
All vendors with access to TechVenture data or systems must:
- Complete the Vendor Security Questionnaire (VSQ) before engagement
- Provide SOC 2 Type II report or equivalent certification
- Accept data processing agreement (DPA) terms
- Undergo annual security reassessment

### 8.2 Vendor Access
- Vendor access limited to specific systems as defined in the access request
- All vendor access via dedicated VPN tunnel with separate credential management
- Vendor access automatically revoked if contract lapses without renewal
- Quarterly vendor access review conducted by IT Security and Procurement

---

## 9. Compliance and Audit

### 9.1 Regulatory Framework
TechVenture Sdn Bhd maintains compliance with:
- Malaysian Personal Data Protection Act (PDPA) 2010
- ISO 27001:2022 (certified)
- SOC 2 Type II (annual audit)
- PCI DSS (for payment processing components)
- Bank Negara Malaysia Technology Risk Management (BNM-TRM) Guidelines

### 9.2 Audit Schedule
- External audit (ISO 27001): Annually in Q4
- SOC 2 audit: Annually in Q2
- Internal security audit: Quarterly
- Penetration testing: Bi-annual (external), quarterly (internal)

---

## 10. Policy Violations

### 10.1 Enforcement
Violations of this policy may result in:
- First offense: Written warning and mandatory retraining
- Second offense: System access suspension pending investigation
- Third offense: Disciplinary action up to and including termination
- Criminal violations: Reported to appropriate authorities

### 10.2 Exception Process
Exceptions to this policy must be:
1. Requested in writing via the Security Exception Request form
2. Approved by the IT Security Lead and the relevant Department Head
3. Limited to a maximum of 6 months before re-evaluation
4. Documented with compensating controls

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 15 Jan 2024 | IT Security Team | Initial policy |
| 2.0 | 1 Jul 2025 | Azman Ismail | Major revision — MFA requirements, DLP additions |
| 2.1 | 15 Sep 2025 | Sarah Tan | Updated encryption standards to TLS 1.3 |
| 2.2 | 1 Dec 2025 | IT Security Team | Added BYOD requirements, vendor assessment updates |
| 2.3 | 1 Mar 2026 | Azman Ismail | Updated incident response SLAs, added BNM-TRM compliance |

---
*End of Document*
