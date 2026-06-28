# Weekly Project Standup — TechVenture Sdn Bhd
**Date:** Monday, 2 June 2026  
**Time:** 9:00 AM – 9:42 AM MYT  
**Location:** Virtual (Microsoft Teams)  
**Attendees:** Ali Hassan (PM), Sarah Tan (Engineering Lead), Rajesh Kumar (Backend Dev), Mei Ling (Frontend Dev), Farah Aziz (QA Lead), David Lim (DevOps)

---

**[09:00] [Ali - PM]**  
Alright everyone, good morning. Let's kick off the standup. Same format — what you did last week, what's on deck, and any blockers. Sarah, want to start?

**[09:01] [Sarah - Engineering Lead]**  
Sure. So last week we closed out the authentication module refactor. The new OAuth2 flow is working in staging. I ran through the integration tests with Rajesh on Thursday and we're green across the board. This week I'll be focusing on the API gateway performance tuning — we noticed some latency spikes during the load test on Friday.

**[09:03] [Ali - PM]**  
Good stuff on the auth module. On the latency spikes — do we have a timeline for when that needs to be resolved? The client demo is on the 16th.

**[09:03] [Sarah - Engineering Lead]**  
Yeah, I think we can have it sorted by Thursday. I'll need David's help on the CDN configuration though. David, can we sync tomorrow afternoon on that?

**[09:04] [David - DevOps]**  
Tomorrow afternoon works. I'll block out 2 to 3 PM. I was going to bring up the CDN thing anyway — I noticed CloudFront isn't caching the API responses properly. I'll prepare a config review before our sync.

**[09:05] [Ali - PM]**  
Perfect. So Sarah owns the latency fix, target Thursday 5 June, and David you'll support with the CDN config review by tomorrow. Got it. Rajesh?

**[09:06] [Rajesh - Backend Dev]**  
Last week I wrapped up the database migration scripts for the new reporting module. They've been tested on the staging DB. This week I'm starting on the notification service — the push notification integration with Firebase. I'm estimating about 4 days for the initial implementation.

**[09:07] [Ali - PM]**  
Okay, so we're looking at end of week for a first working version of notifications?

**[09:07] [Rajesh - Backend Dev]**  
End of week for the backend piece, yeah. But I'll need the notification templates from the design team. Mei Ling, has Aisha finalised those yet?

**[09:08] [Mei Ling - Frontend Dev]**  
She sent me the mockups on Friday but they're still missing the error state designs. I pinged her about it. I think she'll have them by Wednesday latest.

**[09:09] [Ali - PM]**  
Alright, Mei Ling can you confirm with Aisha today and let Rajesh know by end of day whether Wednesday is firm? We don't want the notification work blocked on design assets.

**[09:09] [Mei Ling - Frontend Dev]**  
Will do. On my side — last week I finished the dashboard redesign for the analytics module. It's in code review right now. This week I'm picking up the mobile responsive fixes for the onboarding flow. There are about 12 tickets in the backlog for that.

**[09:11] [Ali - PM]**  
Those responsive fixes — are they all P1 or is there a mix?

**[09:11] [Mei Ling - Frontend Dev]**  
Mix. About 5 are P1, the rest are P2. I'll knock out the P1s by Wednesday and then assess the P2s.

**[09:12] [Ali - PM]**  
Sounds good. Prioritise the P1s. If the P2s slip to next sprint that's acceptable. Farah, QA update?

**[09:13] [Farah - QA Lead]**  
So we completed regression testing on the auth module — 147 test cases, all passing. I've already signed off on that. This week my focus is preparing the test plan for the notification service. Rajesh, can you share the API spec by Wednesday so I can start writing test cases in parallel?

**[09:14] [Rajesh - Backend Dev]**  
Yeah, I can have a draft API spec to you by Wednesday morning. It might evolve slightly but the core endpoints should be stable.

**[09:14] [Farah - QA Lead]**  
That works. Also, I want to flag — we found a minor bug in the reporting module during exploratory testing. It's not a blocker but the CSV export truncates at 10,000 rows. I've logged it as BUG-2847. Rajesh, can you take a look when you get a chance?

**[09:15] [Rajesh - Backend Dev]**  
Yeah, I saw that come through. It's probably the pagination limit in the export query. I'll fix it this week — should be a quick one.

**[09:16] [Ali - PM]**  
Thanks. David, your turn.

**[09:16] [David - DevOps]**  
Right. Last week I completed the Terraform scripts for the production environment upgrade. We're now on the new instance types. Cost savings should show up in next month's bill — estimating about 15% reduction on compute. This week, aside from helping Sarah with CDN, I need to set up the monitoring dashboards for the notification service. Rajesh, once you have the service skeleton up, can you give me a heads up so I can configure the CloudWatch alarms?

**[09:18] [Rajesh - Backend Dev]**  
Sure. Probably by Wednesday I'll have something deployed to dev that you can point at.

**[09:18] [David - DevOps]**  
Cool. Also, just a reminder to everyone — the SSL certificate for api.techventure.com.my expires on the 20th of June. I'll handle the renewal but if anyone sees certificate warnings in staging next week, that's me testing the rotation process.

**[09:19] [Ali - PM]**  
Good call flagging that. Make sure you document the rotation process in Confluence when you're done — we should have a runbook for that.

**[09:20] [David - DevOps]**  
Yep, already on my list.

**[09:20] [Ali - PM]**  
Alright, let me summarise the key blockers and dependencies. Sarah is waiting on David for CDN config — syncing tomorrow. Rajesh needs design templates from Aisha via Mei Ling — confirmation by end of today. Farah needs API spec from Rajesh by Wednesday. Anything else?

**[09:21] [Sarah - Engineering Lead]**  
One more thing — I want to bring up the client demo on June 16th. We need to decide what we're showing. I'd suggest the new auth flow, the analytics dashboard, and if it's ready, a preview of the notification system.

**[09:22] [Ali - PM]**  
Good thinking. Let's plan a dry run on Friday the 13th. Everyone who's presenting should have their demo scripts ready by Thursday evening. I'll send a calendar invite after this call. Sarah, you'll lead the demo?

**[09:23] [Sarah - Engineering Lead]**  
Happy to. I'll draft the demo script and share it by Wednesday for feedback.

**[09:24] [Ali - PM]**  
Great. Anything else from anyone?

**[09:24] [Mei Ling - Frontend Dev]**  
Quick one — the new design system components library that Aisha's team published. Should I start migrating our existing components this sprint or next?

**[09:25] [Ali - PM]**  
Next sprint. Let's not introduce migration risk before the client demo. Park it for now and we'll prioritise it in sprint planning on the 16th.

**[09:25] [Mei Ling - Frontend Dev]**  
Makes sense. Noted.

**[09:26] [Ali - PM]**  
Alright team, great standup. Quick recap of key dates: CDN fix by Thursday 5th, API spec draft by Wednesday 4th, demo dry run Friday 13th, client demo Monday 16th. Let's keep the momentum. Have a good week everyone.

**[09:27] [All]**  
Thanks! / Cheers / 👍

---
*Meeting ended at 09:27 AM MYT*
