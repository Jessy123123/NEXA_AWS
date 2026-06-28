# Cross-Team Planning Session — Platform Integration Sprint
**Company:** TechVenture Sdn Bhd  
**Date:** Thursday, 5 June 2026  
**Time:** 10:00 AM – 11:25 AM MYT  
**Location:** Virtual (Google Meet)  
**Attendees:** Ali Hassan (PM - Platform), Priya Nair (PM - Mobile), Sarah Tan (Engineering Lead - Platform), Hafiz Rahman (Engineering Lead - Mobile), Farah Aziz (QA Lead), David Lim (DevOps), Tan Jia Wen (Data Engineering Lead), Lisa Ooi (Product Design Lead)

---

**[10:00] [Ali - PM, Platform]**  
Morning everyone. So the purpose of today's session is to align on the integration sprint between Platform and Mobile teams for June. We've got the API v2 launch targeting June 23rd and the mobile app update shipping June 30th. There are a lot of cross-dependencies so let's map them out and agree on owners. Priya, want to start with what your team needs from Platform?

**[10:02] [Priya - PM, Mobile]**  
Thanks Ali. So the mobile app v3.2 release has four major features that depend on Platform APIs: the real-time notification system, the new analytics dashboard widgets, the offline sync capability, and the updated user profile endpoints. Of these, the most critical dependency is the notification system because it requires the WebSocket gateway that Sarah's team is building.

**[10:04] [Sarah - Engineering Lead, Platform]**  
The WebSocket gateway is about 70% complete. We're on track for a testable version in staging by June 10th. The main risk is the authentication handshake — we need to support both JWT and the legacy session tokens during the migration period. Hafiz, does the mobile app use JWT already or are you still on session tokens?

**[10:05] [Hafiz - Engineering Lead, Mobile]**  
We migrated to JWT in the v3.0 release back in March. So we're good on JWT. But we do need the gateway to support token refresh without dropping the WebSocket connection. Is that in scope?

**[10:06] [Sarah - Engineering Lead, Platform]**  
It's in the design doc but I haven't implemented it yet. Let me check with Rajesh on the level of effort. I think it's maybe a day or two of work. I'll confirm by end of today and if it's doable, we'll include it in the June 10th staging release.

**[10:07] [Ali - PM, Platform]**  
Sarah, flag to me immediately if it's more than 2 days — we'll need to re-scope. Hafiz, in the worst case where token refresh isn't supported at gateway level, does your team have a fallback?

**[10:08] [Hafiz - Engineering Lead, Mobile]**  
We could handle it client-side with a reconnect strategy, but it would add about 500ms of perceived latency on token refresh. Not ideal for user experience but functional. I'd prefer the server-side solution.

**[10:09] [Ali - PM, Platform]**  
Agreed. Let's target server-side but have the client-side fallback as Plan B. Sarah owns the confirmation by EOD today. Moving on — Jia Wen, the analytics dashboard widgets. Where are we on the data endpoints?

**[10:10] [Tan Jia Wen - Data Engineering Lead]**  
The aggregation pipeline is ready. We're serving the data through a new set of REST endpoints — five in total. Documentation is in Swagger and I shared the link in the project Slack channel yesterday. However, I want to flag a concern about query performance. The "revenue over time" endpoint is doing a full table scan right now and response times are around 3 seconds. I need to optimise the query with a materialised view.

**[10:12] [Priya - PM, Mobile]**  
Three seconds is too slow for mobile. Our UX benchmark is 800ms for any data load. What timeline are we looking at for the optimisation?

**[10:12] [Tan Jia Wen - Data Engineering Lead]**  
If I start Monday, the materialised view should be ready by Wednesday June 11th. Once that's in place, response time should drop to under 200ms. But I need David to set up the scheduled refresh job for the materialised view — it needs to run every 15 minutes.

**[10:13] [David - DevOps]**  
Easy enough. Jia Wen, once you've got the view defined, send me the refresh script and I'll set up the cron job. I can have it running same day you're ready.

**[10:14] [Ali - PM, Platform]**  
Good. So Jia Wen owns the materialised view by June 11th, David sets up the refresh job same day. Priya, your team can start integrating against the other 4 endpoints immediately and pick up the revenue endpoint once it's optimised. Works?

**[10:15] [Priya - PM, Mobile]**  
Works. Hafiz, can you assign someone to start on the widget integration Monday?

**[10:15] [Hafiz - Engineering Lead, Mobile]**  
I'll put Amir on it. He built the existing dashboard so he has context. Amir can start with the 4 ready endpoints on Monday and pick up the 5th when Jia Wen's optimisation lands.

**[10:16] [Lisa Ooi - Product Design Lead]**  
Quick design input — the widget layouts I shared last week assume all 5 data points load simultaneously for the chart animations to work properly. If one endpoint is delayed, we need a loading skeleton state for that specific widget. Hafiz, is that supported in the current component library?

**[10:17] [Hafiz - Engineering Lead, Mobile]**  
We have skeleton loaders but not at individual widget level. It would need about half a day to implement. I can have Mei Ling handle that alongside her responsive fixes.

**[10:18] [Lisa Ooi - Product Design Lead]**  
I'll share the skeleton state specs with Mei Ling by Monday morning so she has what she needs.

**[10:19] [Ali - PM, Platform]**  
Good. Lisa sends specs Monday, Mei Ling implements skeleton loaders. Next topic — offline sync. This is a big one. Sarah, the sync protocol design was supposed to be finalised last week. Status?

**[10:20] [Sarah - Engineering Lead, Platform]**  
Yeah, so we hit a design disagreement. The question is whether we do operational transform or last-write-wins for conflict resolution. I wrote up both options with trade-offs and shared it in the design review channel. I'd like input from Hafiz and Jia Wen before we commit. Can we timebox a decision by Monday?

**[10:21] [Hafiz - Engineering Lead, Mobile]**  
I reviewed it. From the mobile perspective, last-write-wins is much simpler to implement and covers 90% of our use cases. Operational transform adds 2-3 weeks of work and I don't think we need it for v1.

**[10:22] [Tan Jia Wen - Data Engineering Lead]**  
Agreed from the data side. Last-write-wins with a conflict log that users can review manually. We can always upgrade to OT in a future release if users actually hit conflict issues in practice.

**[10:23] [Ali - PM, Platform]**  
Sarah, you comfortable with last-write-wins plus conflict logging?

**[10:23] [Sarah - Engineering Lead, Platform]**  
Yes, I think the team has spoken and the pragmatic choice is clear. I'll finalise the design doc with last-write-wins approach and circulate the updated version by Monday June 9th. Implementation starts Tuesday.

**[10:24] [Farah - QA Lead]**  
For offline sync testing — I'm going to need a test harness that can simulate intermittent connectivity. David, is there something we can set up in staging?

**[10:25] [David - DevOps]**  
Yeah, I can configure a network throttling proxy in the staging environment. Give me until June 12th to set that up. I'll use Toxiproxy — it lets you inject latency, drops, and timeouts on demand.

**[10:26] [Farah - QA Lead]**  
Perfect. I'll write the test scenarios in parallel and have them ready to execute once the proxy is in place. Target start for offline sync testing is June 16th.

**[10:27] [Priya - PM, Mobile]**  
That's tight. The mobile release is June 30th and we need at least a week of regression testing. That means code complete for offline sync by June 20th. Hafiz, is that realistic?

**[10:28] [Hafiz - Engineering Lead, Mobile]**  
It's tight but doable if the platform sync endpoints are stable by June 16th. Sarah?

**[10:28] [Sarah - Engineering Lead, Platform]**  
June 16th for stable sync endpoints — yes, I can commit to that. That gives us a week from when we start implementation.

**[10:29] [Ali - PM, Platform]**  
Alright, let me map the critical path: design doc finalised June 9th, platform implementation June 10-16, mobile integration June 16-20, QA testing June 16-27, release June 30th. It's achievable but there's zero slack. If anything slips by more than a day, we need to have a scope conversation immediately.

**[10:30] [Priya - PM, Mobile]**  
Agreed. I'd like to propose a daily check-in at 9:30 AM from June 16th onwards, just 10 minutes, focused only on the offline sync workstream. Does that work for Sarah, Hafiz, and Farah?

**[10:31] [Sarah - Engineering Lead, Platform]**  
Works for me.

**[10:31] [Hafiz - Engineering Lead, Mobile]**  
Same.

**[10:31] [Farah - QA Lead]**  
I'm in.

**[10:32] [Ali - PM, Platform]**  
Good. Priya, you'll set up that recurring meeting. Last topic — the user profile endpoints update. Jia Wen, any data model changes we should be aware of?

**[10:33] [Tan Jia Wen - Data Engineering Lead]**  
Yes, we're adding three new fields to the user profile: preferred_language, notification_preferences as a JSON blob, and last_active_timestamp. The migration script is ready. I plan to run it on staging this Friday and production on Monday June 9th during the maintenance window.

**[10:34] [Hafiz - Engineering Lead, Mobile]**  
Are the new fields optional or required? We don't want the mobile app to break for existing users who don't have these fields populated.

**[10:35] [Tan Jia Wen - Data Engineering Lead]**  
All optional with sensible defaults. preferred_language defaults to "en", notification_preferences defaults to all-enabled, last_active_timestamp populates on first login.

**[10:36] [Hafiz - Engineering Lead, Mobile]**  
Good. We'll add the profile fields to the mobile settings screen. I'll put it in our sprint — it's about a day of work.

**[10:37] [Lisa Ooi - Product Design Lead]**  
I have designs for the notification preferences UI. They're in Figma — I'll share the direct link in the Mobile channel after this meeting. One thing to note — the notification preferences screen needs to map to 6 different notification categories. Jia Wen, the JSON blob schema should reflect those categories.

**[10:38] [Tan Jia Wen - Data Engineering Lead]**  
Send me the categories and I'll update the schema today. I want to align before running the migration.

**[10:39] [Lisa Ooi - Product Design Lead]**  
I'll send you the category list within the hour.

**[10:40] [Ali - PM, Platform]**  
Great. Let's wrap up. I'll send a summary email after this with all owners and dates. Key risks I'm tracking: offline sync critical path has no buffer, and the analytics endpoint performance needs the materialised view. Any final items?

**[10:41] [David - DevOps]**  
One operational item — I'm scheduling the staging environment upgrade for this Saturday June 7th, 6 AM to 10 AM. Staging will be down during that window. Just so no one panics if their tests fail on Saturday morning.

**[10:42] [Ali - PM, Platform]**  
Thanks for the heads up. Send a reminder to the engineering-all channel tomorrow. Alright everyone, great session. Let's execute.

**[10:43] [All]**  
Thanks! / Great session / 👋

---
*Meeting ended at 10:43 AM MYT*
