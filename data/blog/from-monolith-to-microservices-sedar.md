---
title: "From Monolith to Microservices at SEDAR: 70% Faster, 40% Safer Deploys"
date: 2025-08-14
slug: from-monolith-to-microservices-sedar
excerpt: "Breaking a Java monolith into independently deployable services cut response times by 70% and deploy times by 40% — without the distributed-systems horror stories. Here's the playbook."
tags: ['Microservices', 'Java', 'Performance', 'Architecture']
author: Nizar Kadri
readingTime: 9
featured: false
---

## The monolith wasn't the problem. The seams were.

SEDAR — Canada's System for Electronic Document Analysis and Retrieval, the filing backbone for Canadian securities — is not a toy workload. Regulators, issuers, and investors all depend on it, and the bar for correctness is "audit-grade." When I joined the team, the application was a long-lived Java monolith: one deployable, one database, one failure domain. It worked, but every change required a full regression pass, deploys were slow and risky, and a slow module could drag down unrelated features.

The instinct is to say "microservices!" and split everything. The disciplined answer is narrower: **find the seams that already exist, split those first, and measure everything**.

## Step one: map the politics, not just the code

Before splitting anything, I mapped which modules changed together, which teams owned them, and which had different scaling needs. Modules that always changed together were not a seam — splitting them would only add network hops. Modules with clear ownership and different load profiles were. That map, not the package diagram, became the migration plan.

Three principles guided every cut:

- **Split along business capabilities**, not technical layers. "Filing intake" is a capability. "The services layer" is not.
- **Keep the database honest.** Each new service gets its own tables. Shared-database "microservices" are just a monolith with latency.
- **Strangler, not big bang.** Route traffic to the new service incrementally behind flags or proxies, so rollback is a config change, not a redeploy.

## What the numbers said

After the first splits went live, the measurements were stark:

- **~70% improvement in response times** on the extracted hot paths. The monolith had been serializing work that had no real dependency — independent reads queued behind unrelated transactions.
- **~40% reduction in deploy time.** Deploying one service with its own pipeline replaced the full-monolith regression gate for the majority of changes. Smaller blast radius meant faster, more frequent, more boring releases.
- Fewer cross-team merge conflicts, because the seams matched the ownership map.

The headline lesson: the performance win didn't come from "microservices" as a label. It came from removing accidental coupling — work that was serialized only because it happened to live in the same process.

## The hard parts nobody puts in the slide deck

**Distributed transactions.** The moment you split, "update A and B atomically" becomes a saga, an outbox, or a reconciliation job. There is no free lunch. We made the trade-offs explicit per workflow and put compensating actions where true atomicity was impossible.

**Observability lag.** In a monolith, a stack trace is one place. Across services, you need correlation IDs, structured logs, and dashboards *before* the split, not after the first incident. We added tracing on the seams first.

**Local development pain.** Running one process is easy. Running six services locally is a tax. A composed dev environment (containers plus seeded data) paid for itself within weeks.

**The temptation to split further.** After the first wins, every team wants to split. We said no to most of it. The goal was the smallest architecture that fixed the measured problems — not the most services.

## A playbook you can steal

1. **Measure first.** Baseline latency, deploy time, and change-failure rate. Without numbers, "microservices" is fashion.
2. **Map change coupling.** Split where changes are already decoupled.
3. **Strangle traffic.** Never big-bang a cutover in a regulated system.
4. **Own your data.** One service, one schema. No shared tables.
5. **Instrument before you split.** Correlation IDs and dashboards precede the first network hop.
6. **Stop when the pain is gone.** Every additional service is permanent operational cost.

Monoliths are not failures, and microservices are not a virtue. Architecture is the art of choosing which problems you prefer to have. At SEDAR, we chose smaller, independently deployable capabilities — and the 70% and 40% numbers are what that choice bought us.
