# Cloud Migration Strategy 2026
**Company:** TechVenture Sdn Bhd  
**Document ID:** STRAT-ENG-CM-001  
**Version:** 1.0  
**Date:** 15 January 2026  
**Classification:** Confidential  
**Prepared By:** Azman Ismail, VP Engineering  
**Reviewed By:** Tan Wei Ming (CFO), Lim Kok Wai (CEO)  
**Status:** Approved for Execution

---

## Executive Summary

TechVenture Sdn Bhd currently operates a hybrid infrastructure with approximately 60% of workloads on-premises (Cyberjaya data centre) and 40% on AWS. This strategy document outlines the plan to migrate remaining on-premises workloads to AWS, achieving a target state of 95% cloud-native by December 2026.

**Key Drivers:**
- Data centre lease expiry in March 2027 (non-renewable due to building redevelopment)
- On-premises infrastructure reaching end-of-life (servers purchased 2019-2021)
- Scaling limitations impacting customer growth (current capacity: 10,000 concurrent users; target: 50,000)
- Operational cost reduction opportunity: estimated 30% reduction in total infrastructure spend post-migration

**Investment Required:** RM 3.2 million (migration execution: RM 2.1M, modernisation: RM 800K, contingency: RM 300K)  
**Expected Annual Savings:** RM 1.8 million (from Year 2 onwards)  
**Payback Period:** 22 months

---

## 2. Current State Assessment

### 2.1 Infrastructure Inventory

| Component | Current Location | Count | Status |
|---|---|---|---|
| Application servers | On-premises | 24 | 8 at end-of-life |
| Database servers (MySQL) | On-premises | 6 | Running MySQL 5.7 (EOL) |
| Database servers (PostgreSQL) | AWS RDS | 4 | Current |
| File storage | On-premises NAS | 45 TB | 78% utilised |
| Kubernetes cluster | On-premises | 12 nodes | K8s 1.24 (2 versions behind) |
| Message queue (RabbitMQ) | On-premises | 3-node cluster | Stable |
| Redis cache | AWS ElastiCache | 6 nodes | Current |
| Object storage | AWS S3 | ~120 TB | Current |
| CI/CD (Jenkins) | On-premises | 4 build agents | Frequent capacity issues |
| Monitoring (Prometheus/Grafana) | On-premises | 2 servers | Migrating to Datadog |

### 2.2 Application Portfolio

| Application | Criticality | Migration Complexity | Strategy |
|---|---|---|---|
| Customer Portal (monolith) | Critical | High | Refactor to microservices |
| Admin Dashboard | High | Medium | Replatform (containerise) |
| Payment Gateway | Critical | High | Replatform (security review required) |
| Reporting Engine | Medium | Low | Lift and shift |
| Internal Tools Suite | Low | Low | Lift and shift |
| ML/AI Pipeline | High | Medium | Refactor (leverage SageMaker) |
| Legacy CRM Integration | Medium | High | Replace (move to API-based) |
| Email Service | Low | Low | Replace (migrate to SES) |

### 2.3 Key Risks (Current State)
1. **Single point of failure:** On-premises data centre has no geographic redundancy
2. **Compliance gap:** Current setup does not meet BNM-TRM requirements for disaster recovery
3. **Talent constraint:** On-premises infrastructure requires specialised skills increasingly difficult to hire
4. **Scaling ceiling:** Physical server capacity limits customer onboarding to ~200 new enterprise accounts per quarter

---

## 3. Target State Architecture

### 3.1 Design Principles
- Cloud-native first: Leverage managed services (serverless, containers, managed databases)
- Multi-AZ deployment: All critical workloads across minimum 2 availability zones
- Infrastructure as Code: 100% Terraform-managed with GitOps workflow
- Zero-trust security: Service mesh (Istio) with mTLS between all services
- Observability-first: Centralised logging, tracing, and metrics from day one

### 3.2 Target Architecture Components

| Component | Target Service | Region |
|---|---|---|
| Compute (containers) | Amazon EKS (Kubernetes 1.29) | ap-southeast-1 |
| Compute (serverless) | AWS Lambda | ap-southeast-1 |
| Database (relational) | Amazon Aurora MySQL + PostgreSQL | ap-southeast-1 (multi-AZ) |
| Database (NoSQL) | Amazon DynamoDB | ap-southeast-1 |
| Object storage | Amazon S3 (existing, expand) | ap-southeast-1 |
| File storage | Amazon EFS | ap-southeast-1 |
| Message queue | Amazon SQS + SNS | ap-southeast-1 |
| Cache | Amazon ElastiCache Redis (existing) | ap-southeast-1 |
| CDN | Amazon CloudFront | Global |
| ML/AI | Amazon SageMaker | ap-southeast-1 |
| CI/CD | AWS CodePipeline + GitHub Actions | ap-southeast-1 |
| Monitoring | Datadog (SaaS) | N/A |
| DNS | Amazon Route 53 | Global |
| WAF | AWS WAF + Shield Advanced | ap-southeast-1 |

### 3.3 Disaster Recovery
- RPO: 1 hour (critical systems), 4 hours (non-critical)
- RTO: 2 hours (critical systems), 8 hours (non-critical)
- DR region: ap-southeast-3 (Jakarta) — cross-region replication for databases and S3
- Quarterly DR drill mandatory

---

## 4. Migration Phases

### Phase 1: Foundation (January – March 2026) ✅ COMPLETE
- [x] AWS Landing Zone setup (Control Tower, Organizations, SSO)
- [x] Network architecture (Transit Gateway, VPC design, Direct Connect)
- [x] Security baseline (GuardDuty, Security Hub, Config Rules)
- [x] CI/CD pipeline migration (Jenkins → CodePipeline + GitHub Actions)
- [x] Team training (AWS Certified Solutions Architect — 6 engineers)

### Phase 2: Non-Critical Workloads (April – June 2026) 🔄 IN PROGRESS
- [x] Internal tools suite — lift and shift (completed April 15)
- [x] Reporting engine — lift and shift (completed May 2)
- [ ] Email service — replace with SES (target: June 15)
- [ ] Legacy CRM integration — replace with API gateway (target: June 30)
- [ ] Development and staging environments — full migration (target: June 20)

### Phase 3: Core Platform (July – September 2026)
- Customer Portal refactoring (monolith → microservices)
- Admin Dashboard containerisation
- Database migration (MySQL 5.7 → Aurora MySQL 8.0)
- ML/AI Pipeline migration to SageMaker
- Performance testing and optimisation

### Phase 4: Critical Systems (October – November 2026)
- Payment Gateway migration (requires PCI DSS re-certification)
- Production traffic cutover (blue-green deployment)
- On-premises decommission planning
- DR setup and validation

### Phase 5: Optimisation & Decommission (December 2026 – February 2027)
- Cost optimisation (Reserved Instances, Savings Plans, right-sizing)
- On-premises hardware decommission and data centre exit
- Final security audit and compliance certification
- Knowledge transfer and documentation

---

## 5. Budget Breakdown

| Phase | Timeline | Budget (RM) | Status |
|---|---|---|---|
| Phase 1: Foundation | Jan–Mar 2026 | 450,000 | ✅ Complete (actual: 420,000) |
| Phase 2: Non-Critical | Apr–Jun 2026 | 380,000 | 🔄 On track |
| Phase 3: Core Platform | Jul–Sep 2026 | 1,100,000 | Planned |
| Phase 4: Critical Systems | Oct–Nov 2026 | 850,000 | Planned |
| Phase 5: Optimisation | Dec 2026–Feb 2027 | 120,000 | Planned |
| Contingency (10%) | — | 300,000 | Reserve |
| **Total** | | **3,200,000** | |

### 5.1 Ongoing Cost Projection (Post-Migration)

| Cost Category | Current Monthly | Target Monthly | Savings |
|---|---|---|---|
| Data centre lease | RM 85,000 | RM 0 | RM 85,000 |
| Hardware maintenance | RM 25,000 | RM 0 | RM 25,000 |
| On-prem licenses (VMware, etc.) | RM 18,000 | RM 0 | RM 18,000 |
| AWS spend | RM 65,000 | RM 140,000 | -RM 75,000 |
| Managed services (Datadog, etc.) | RM 12,000 | RM 28,000 | -RM 16,000 |
| Staff (reduced on-prem ops) | RM 45,000 | RM 15,000 | RM 30,000 |
| **Net Monthly** | **RM 250,000** | **RM 183,000** | **RM 67,000** |

**Annual Savings: RM 804,000** (operational) + **RM 996,000** (avoided capex refresh) = **RM 1.8M total**

---

## 6. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Data loss during migration | Low | Critical | Pre-migration backup, parallel run period, validated restore procedures |
| R2 | Extended downtime during cutover | Medium | High | Blue-green deployment, automatic rollback, maintenance window planning |
| R3 | Cost overrun due to scope changes | Medium | Medium | Monthly budget reviews, contingency reserve, scope change process |
| R4 | Team skill gaps | Medium | Medium | Training program (Phase 1), AWS partner support, contractor augmentation |
| R5 | Vendor lock-in | Low | Medium | Container-first strategy, abstraction layers, multi-cloud DNS |
| R6 | Compliance gap during transition | Low | High | Continuous compliance monitoring, parallel certification |
| R7 | Application performance regression | Medium | High | Performance baseline before migration, load testing at each phase |
| R8 | Data sovereignty concerns | Low | Medium | All data remains in ap-southeast-1, DR in ap-southeast-3 (both ASEAN) |

---

## 7. Success Criteria

| Metric | Target | Measurement |
|---|---|---|
| Workload migration | 95% on cloud | Monthly infrastructure audit |
| Application availability | 99.95% | Monthly SLA report |
| Mean Time to Recovery | < 2 hours | Incident metrics |
| Cost reduction | 30% vs. current | Quarterly cost comparison |
| Deployment frequency | 10x improvement | CI/CD metrics |
| Security compliance | Zero critical findings | Quarterly audit |
| Team satisfaction | > 4.0/5.0 | Bi-annual survey |

---

## 8. Governance

- **Executive Sponsor:** Lim Kok Wai, CEO
- **Migration Lead:** Azman Ismail, VP Engineering
- **Technical Lead:** David Lim, DevOps Lead
- **Finance Oversight:** Tan Wei Ming, CFO
- **Steering Committee:** Monthly review (first Monday of each month)
- **Working Committee:** Weekly standup (every Tuesday 10 AM)

---

## Appendix A: Team Structure

| Role | Name | Allocation |
|---|---|---|
| Migration Architect | David Lim | 100% |
| Backend Migration | Rajesh Kumar | 50% |
| Database Migration | Tan Jia Wen | 75% |
| Security | Sarah Tan (oversight) | 25% |
| Testing | Farah Aziz | 50% |
| Project Management | Ali Hassan | 30% |

---
*End of Document*
