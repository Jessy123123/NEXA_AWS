# Incident Postmortem — Production Outage INC-2026-0089
**Company:** TechVenture Sdn Bhd  
**Date:** Monday, 9 June 2026  
**Time:** 3:00 PM – 4:10 PM MYT  
**Location:** War Room 2, Level 12 + Virtual  
**Attendees:** Azman Ismail (VP Engineering), Sarah Tan (Engineering Lead), David Lim (DevOps), Rajesh Kumar (Backend Dev), Farah Aziz (QA Lead), Ali Hassan (PM), Nurul Huda (Finance Manager — observer)

**Incident Summary:**  
On Saturday, 7 June 2026 at 09:47 AM MYT, the production API cluster experienced a cascading failure resulting in complete service unavailability for 2 hours and 23 minutes. All customer-facing APIs returned 503 errors. Approximately 3,400 active users were impacted. Service was fully restored at 12:10 PM MYT.

---

**[15:00] [Azman - VP Engineering]**  
Alright everyone, let's get into this. First, I want to set the tone — this is a blameless postmortem. We're here to understand what happened, why it happened, and how we prevent it from happening again. David, you were the incident commander. Walk us through the timeline.

**[15:02] [David - DevOps]**  
Right. So the incident started during the planned staging environment upgrade on Saturday. The upgrade window was 6 AM to 10 AM for staging only. At 09:47 AM, I received a PagerDuty alert — production API response times had spiked to over 30 seconds and error rates hit 85%. Within 2 minutes, it was a full outage.

**[15:04] [Azman - VP Engineering]**  
But the upgrade was supposed to be staging only. How did it affect production?

**[15:04] [David - DevOps]**  
This is where it gets interesting. The root cause was a shared configuration service. When I upgraded the staging environment, the Terraform script I ran had a variable that pointed to the shared configuration service. The new staging instances pulled their config from the same Config Server that production uses. During the upgrade, the Config Server was restarted as part of the staging deployment, and when it came back up, it briefly served staging-environment variables to production instances.

**[15:06] [Sarah - Engineering Lead]**  
So production services picked up staging database credentials?

**[15:07] [David - DevOps]**  
Exactly. For about 90 seconds, the Config Server served staging environment variables. Production API instances that refreshed their config during that window connected to the staging database, which obviously doesn't have production data and has different schema versions. That caused exceptions across the board. But the cascading part happened because of the health check behaviour.

**[15:08] [Rajesh - Backend Dev]**  
I can explain that part. Our health check endpoint does a database connectivity test. When the production instances connected to the wrong database, the health checks started failing. The load balancer marked those instances as unhealthy and took them out of rotation. But because ALL instances refreshed config within that 90-second window, they ALL got marked unhealthy simultaneously.

**[15:10] [Azman - VP Engineering]**  
So the load balancer had zero healthy backends.

**[15:10] [Rajesh - Backend Dev]**  
Yes. And here's the second problem — our auto-scaling group launched new instances to replace the "unhealthy" ones, but the new instances also pulled config from the same Config Server. By that time, the Config Server had corrected itself and was serving the right config again, but the new instances failed to start because of a race condition in the connection pool initialiser.

**[15:12] [David - DevOps]**  
The race condition was this: the new instances tried to establish connections to the production database, but the connection pool limit was already exhausted by the original instances that had recovered and reconnected. So the new instances kept crashing in a boot loop.

**[15:13] [Azman - VP Engineering]**  
How did we eventually recover?

**[15:14] [David - DevOps]**  
At 11:15 AM, after an hour of troubleshooting, I identified the connection pool exhaustion issue. I manually terminated all instances in the auto-scaling group and set the desired count to zero. Then I increased the RDS connection limit from 200 to 500, waited for that to take effect, and then brought the instances back up 2 at a time. Full service restoration was confirmed at 12:10 PM.

**[15:16] [Azman - VP Engineering]**  
Two hours and 23 minutes of downtime. That's our worst incident this year. Let's talk about why it took so long to diagnose. David, what slowed you down?

**[15:17] [David - DevOps]**  
Two things. First, I initially assumed the production issue was unrelated to the staging upgrade because they're supposed to be isolated environments. So I spent the first 20 minutes investigating production changes that hadn't happened. Second, our logging was being written to the staging log group once the config got swapped, so I was looking at production CloudWatch logs and seeing nothing useful — the actual error logs were going to the staging log group.

**[15:19] [Sarah - Engineering Lead]**  
That's a critical finding. The Config Server being shared between environments is a fundamental architecture issue. We've discussed separating it before but it never got prioritised.

**[15:20] [Azman - VP Engineering]**  
It's getting prioritised now. What about the response process? How long until we had the right people on the call?

**[15:21] [David - DevOps]**  
PagerDuty alerted me at 09:47. I acknowledged at 09:49 and started investigating. I escalated to Sarah at 10:05 when I couldn't identify the cause alone. We opened the incident bridge at 10:10. Rajesh joined at 10:15. So about 25 minutes to full team assembly. That's within our SLA.

**[15:22] [Farah - QA Lead]**  
I want to flag something from the QA perspective. We don't have any integration tests that validate environment isolation. If we had a test that verified production instances cannot resolve staging database endpoints, we would have caught the shared Config Server risk during the upgrade planning.

**[15:23] [Azman - VP Engineering]**  
Good point. Alright, let's shift to remediation actions. I'm going to go around the room and I want concrete actions with owners and deadlines. David, start with infrastructure.

**[15:24] [David - DevOps]**  
Three items from me. First, I need to separate the Config Server into dedicated instances per environment. Production gets its own Config Server that staging deployments cannot touch. I'm estimating a week of work — target completion June 16th. Second, I'll implement config change detection alerting. If any production instance receives a config value that doesn't match the expected production baseline, we get an immediate P1 alert. Target June 13th. Third, I need to increase the RDS connection pool limit permanently and add auto-scaling for connections. Target June 11th for the connection limit increase.

**[15:27] [Azman - VP Engineering]**  
The Config Server separation is the highest priority. Nothing else ships that could affect production until that's done. Sarah?

**[15:27] [Sarah - Engineering Lead]**  
Two items. First, I want to add a circuit breaker to the config refresh mechanism. If an instance detects that its config has changed to unexpected values — like a different database hostname — it should refuse the new config and alert rather than applying it blindly. Rajesh and I can implement this. Target June 13th. Second, I want to implement graceful degradation — if the database connection fails, the API should serve cached responses for read endpoints rather than immediately returning 503. This is a bigger piece of work, maybe 2 weeks. Target June 23rd.

**[15:30] [Rajesh - Backend Dev]**  
I'll add to that — we need to fix the connection pool race condition in the instance bootstrap. The fix is to implement exponential backoff with jitter on connection acquisition during startup. I can have that done by June 11th.

**[15:31] [Farah - QA Lead]**  
From QA, I'm going to create an environment isolation test suite. This will run before any infrastructure change to verify that environment boundaries are respected. I'll also add chaos testing scenarios for config drift. Test suite ready by June 18th.

**[15:33] [Ali - PM]**  
From the communications side, I need to update our incident communication playbook. We didn't send a customer notification until 10:30 AM — that's 43 minutes after the outage started. Our SLA says within 15 minutes. I'll revise the playbook and add automated status page updates triggered by PagerDuty severity levels. Updated playbook by June 12th.

**[15:35] [Azman - VP Engineering]**  
What about the customer impact? Do we have any SLA breach implications?

**[15:35] [Ali - PM]**  
We have 4 enterprise customers with 99.9% uptime SLAs. This incident puts us at 99.82% for June, which would technically breach two of those SLAs if we don't have perfect uptime for the rest of the month. I'm drafting proactive communications to those accounts. They'll go out tomorrow with an explanation and our remediation plan.

**[15:37] [Nurul Huda - Finance Manager]**  
For context on the financial exposure — the two at-risk SLA breaches carry penalty clauses totalling RM 85K if triggered. We should factor the remediation infrastructure costs against that potential liability.

**[15:38] [Azman - VP Engineering]**  
Understood. Alright, any remaining items?

**[15:39] [David - DevOps]**  
One more — I want to propose we institute a change freeze for production-adjacent infrastructure 48 hours before and after any staging upgrade. Would have prevented Saturday's incident entirely.

**[15:40] [Azman - VP Engineering]**  
Reasonable. But let me push back slightly — won't that slow our deployment velocity if staging upgrades are frequent?

**[15:41] [David - DevOps]**  
Once we separate the Config Server, the risk is dramatically reduced and we can relax the freeze policy. Think of it as a temporary safeguard until the architecture fix is in place.

**[15:42] [Azman - VP Engineering]**  
Fair enough. Implement the change freeze policy effective immediately, with a review date of June 23rd once Config Server separation is complete. David, document the policy and communicate it to all engineering teams by Wednesday.

**[15:43] [David - DevOps]**  
Will do.

**[15:44] [Azman - VP Engineering]**  
Let me summarise the key remediation items and their severity ratings. The Config Server separation is our top priority — David, June 16th. Circuit breaker on config refresh — Sarah and Rajesh, June 13th. Connection pool fix — Rajesh, June 11th. Config drift alerting — David, June 13th. Environment isolation tests — Farah, June 18th. Graceful degradation — Sarah, June 23rd. Communication playbook — Ali, June 12th. Change freeze policy — David, Wednesday. I want daily updates on all P0 items in the #incident-remediation Slack channel. Sarah, you're the DRI for tracking overall remediation progress. Any questions?

**[15:47] [Sarah - Engineering Lead]**  
Clear. I'll set up a tracking board in Jira and link it in the Slack channel.

**[15:48] [Azman - VP Engineering]**  
Good. Last thing — let's schedule a follow-up review for June 20th to verify all critical items are closed. I'll send the invite. Anything else?

**[15:49] [David - DevOps]**  
Just want to acknowledge — the staging upgrade itself was successful. Staging is running great on the new infrastructure. The failure was purely in the blast radius not being properly contained. Lesson learned.

**[15:50] [Azman - VP Engineering]**  
Acknowledged. And again — no blame here. The shared Config Server has been a known risk for months. This incident is the forcing function to fix it properly. Good work on the recovery, David. Alright, that's a wrap. Thanks everyone.

**[15:51] [All]**  
Thanks. / Good session. / Let's make sure this doesn't happen again.

---
*Meeting ended at 15:51 PM MYT*

**Incident Severity:** SEV-1  
**Duration:** 2 hours 23 minutes  
**Users Impacted:** ~3,400  
**Financial Exposure:** RM 85,000 (SLA penalty risk)  
**Root Cause:** Shared Config Server between staging and production environments  
**Contributing Factors:** Missing environment isolation guardrails, connection pool race condition, config change detection gap
