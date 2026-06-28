# Budget Review Meeting — Q2 2026
**Company:** TechVenture Sdn Bhd  
**Date:** Thursday, 28 May 2026  
**Time:** 2:00 PM – 3:15 PM MYT  
**Location:** Meeting Room 4A, Level 12, Menara TechVenture  
**Attendees:** Tan Wei Ming (CFO), Ali Hassan (PM - Project Atlas), Nurul Huda (Finance Manager), Sarah Tan (Engineering Lead), Azman Ismail (VP Engineering), Karen Yap (Procurement)

---

**[14:00] [Tan Wei Ming - CFO]**  
Good afternoon everyone. Thanks for joining. Today we're reviewing the Q2 budget status for Project Atlas and I want to make some decisions on the pending requests before month-end. Nurul, can you walk us through the current spend?

**[14:02] [Nurul Huda - Finance Manager]**  
Sure. So for Project Atlas, our Q2 allocated budget is RM 2.4 million. As of today, we've committed RM 1.67 million, which is about 69.6% utilised. Breakdown is: personnel costs at RM 980K, cloud infrastructure at RM 420K, software licenses at RM 170K, and contractor costs at RM 100K. We have approximately RM 730K remaining for June.

**[14:04] [Tan Wei Ming - CFO]**  
And the run rate — are we on track to stay within budget by end of quarter?

**[14:05] [Nurul Huda - Finance Manager]**  
If we maintain current burn, we'll end Q2 at approximately RM 2.25 million, so about RM 150K under budget. However, there are three pending requests that would push us close to the ceiling.

**[14:06] [Tan Wei Ming - CFO]**  
Right, let's go through those. Ali, the first request is yours — the additional cloud resources?

**[14:07] [Ali - PM]**  
Yes. We're requesting an increase to our AWS spend ceiling from RM 140K per month to RM 195K per month for June. The reason is the notification service we're building requires a dedicated message queue cluster, and we need additional GPU instances for the ML inference pipeline that's going live in June. I've broken it down — RM 35K for the SQS and SNS scaling, and RM 20K for the GPU instances.

**[14:09] [Tan Wei Ming - CFO]**  
That's RM 55K additional for one month. Sarah, is the GPU requirement ongoing or a one-time spike?

**[14:09] [Sarah - Engineering Lead]**  
The GPU cost will drop after initial model deployment. In July we expect it to stabilise at about RM 8K per month because we'll switch to inference-optimised instances. The RM 20K in June covers the training and benchmarking phase.

**[14:10] [Tan Wei Ming - CFO]**  
Okay, so it's front-loaded. And the message queue — that's a permanent increase?

**[14:11] [Ali - PM]**  
The message queue scales with user volume. Based on our projections, once we onboard the first 5,000 users in July, we'll need that capacity permanently. But there's a reserved instance option that brings it down to about RM 25K per month if we commit for 12 months.

**[14:12] [Karen Yap - Procurement]**  
I've already got a quote from our AWS account team for the reserved capacity. If we sign by June 15th, we lock in the discounted rate. Otherwise we pay on-demand through Q3 which would cost about RM 12K more over the quarter.

**[14:13] [Tan Wei Ming - CFO]**  
Nurul, if we approve the RM 55K cloud increase for June and commit to the reserved instance, what's our total Q2 landing?

**[14:14] [Nurul Huda - Finance Manager]**  
With the RM 55K, we land at about RM 2.3 million for Q2. The reserved instance commitment wouldn't hit until July billing so it doesn't affect Q2.

**[14:15] [Tan Wei Ming - CFO]**  
Alright. I'm approving the RM 55K cloud infrastructure increase for June. Karen, go ahead with the reserved instance commitment — sign before June 15th. Make sure Legal reviews the 12-month terms. Ali, you own the justification doc for audit purposes — get that to Nurul by this Friday.

**[14:16] [Ali - PM]**  
Will do. I'll have it to you by Friday morning, Nurul.

**[14:17] [Tan Wei Ming - CFO]**  
Good. Second request — Azman, this is the contractor extension?

**[14:17] [Azman Ismail - VP Engineering]**  
Yes. We currently have two contractors on the data engineering team. Their contracts end June 15th. I'm requesting a 3-month extension for both. The rate is RM 35K per month per contractor, so RM 70K per month total. For Q2, that's only the second half of June, so about RM 35K impact on this quarter's budget.

**[14:19] [Tan Wei Ming - CFO]**  
Why can't we absorb this work with permanent staff?

**[14:19] [Azman Ismail - VP Engineering]**  
We have two open headcount requisitions in the pipeline but hiring has been slow. Realistically, we won't have permanent hires onboarded until August at the earliest. If we let the contractors go on June 15th, the data pipeline migration stalls and that delays the Q3 product launch.

**[14:21] [Tan Wei Ming - CFO]**  
What's the revenue impact of a Q3 launch delay?

**[14:21] [Ali - PM]**  
Our commercial team estimates each month of delay costs us approximately RM 400K in deferred revenue from the enterprise clients waiting on the new analytics module.

**[14:22] [Tan Wei Ming - CFO]**  
Clear enough. Approved — extend both contractors through September 15th. But Azman, I want a firm hiring plan on my desk by June 6th showing how we transition off contractor dependency by Q4. If we're still relying on contractors in October, I'll need a much stronger business case.

**[14:23] [Azman Ismail - VP Engineering]**  
Understood. I'll work with HR and have the transition plan to you by June 6th.

**[14:24] [Tan Wei Ming - CFO]**  
Third item — Nurul, the software license request?

**[14:25] [Nurul Huda - Finance Manager]**  
This one came from the QA team. They're requesting Datadog Enterprise at RM 28K per month, replacing our current New Relic setup which costs RM 12K. So it's a RM 16K monthly increase. The request justification mentions better APM capabilities and the unified logging platform.

**[14:27] [Sarah - Engineering Lead]**  
I can speak to this. We've been evaluating Datadog for three months now. The trial showed us 40% faster incident response times and the unified platform means we can decommission two other tools — PagerDuty and our self-hosted ELK stack. When you factor in the PagerDuty savings of RM 5K per month and the ELK infrastructure savings of RM 7K per month, the net increase is actually only RM 4K per month.

**[14:29] [Tan Wei Ming - CFO]**  
So net-net it's RM 4K additional per month with better capabilities. That's fine in principle but I don't want to approve until I see the decommission timeline for the old tools. If we end up paying for both for 3 months, that's not a RM 4K increase — it's RM 16K.

**[14:30] [Sarah - Engineering Lead]**  
Fair point. We can decommission PagerDuty immediately since Datadog On-Call covers that. ELK decommission needs about 6 weeks for data migration.

**[14:31] [Tan Wei Ming - CFO]**  
Here's what I'll approve: proceed with Datadog from July 1st, not June. That gives you June to prepare the migration plan. PagerDuty cancelled effective July 1st. ELK decommissioned by August 15th. Sarah, you own the migration plan — have it documented and shared with Nurul by June 13th. If the decommission dates slip, the budget impact comes from your team's discretionary spend. Agreed?

**[14:33] [Sarah - Engineering Lead]**  
Agreed. I'll have the migration plan to Nurul by June 13th.

**[14:34] [Tan Wei Ming - CFO]**  
Good. Nurul, update the forecast with today's approvals and send me the revised Q2-Q3 projection by Monday. Include the contractor extension cost in Q3 planning.

**[14:35] [Nurul Huda - Finance Manager]**  
Will do. I'll have the updated forecast to you by Monday morning.

**[14:36] [Tan Wei Ming - CFO]**  
One more thing before we close. I've been asked by the Board to present a technology investment summary at the next Board meeting on June 25th. Ali, I'll need a one-pager from you on Project Atlas ROI — projected revenue contribution, cost to date, and timeline to break-even. Can you have that to me by June 18th?

**[14:37] [Ali - PM]**  
June 18th works. I'll pull the numbers together with Nurul and have a draft for your review by the 16th, final version by the 18th.

**[14:38] [Tan Wei Ming - CFO]**  
Perfect. Alright, I think we're good. To summarise: cloud increase approved, contractors extended with a transition plan due, Datadog approved for July start with conditions. Good meeting everyone. Thanks for the thorough preparation.

**[14:39] [All]**  
Thank you. / Thanks Wei Ming. / Cheers.

---
*Meeting ended at 14:39 PM MYT*
