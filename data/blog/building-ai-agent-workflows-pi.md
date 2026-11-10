---
title: "Building AI Agent Workflows with Pi: Small Models, Sharp Tools"
date: 2025-10-26
slug: building-ai-agent-workflows-pi
excerpt: "How I design agent workflows that stay cheap and reliable, deterministic tools, tiny models for routing, and human checkpoints before anything ships."
tags: ['AI Agents', 'Pi', 'LLM', 'Engineering']
author: Nizar Kadri
readingTime: 8
featured: true
---

## Why most agent demos break in production

Every few months a new agent framework promises autonomous magic. In the demo it books, codes, and ships. In production it loops, burns tokens, and occasionally deletes the wrong thing. The gap is rarely the model. It is the workflow around the model: no deterministic tools, no checkpoints, no cost budget, no way to say "stop and ask a human."

The pattern that has worked for me — in the Pi harness, in classroom prototypes, and in client work — is boring on purpose: **orchestrate, don't delegate everything**. Let the model reason and draft. Let code do everything that can be done deterministically. Compress aggressively. Verify before you act.

## The three layers

### 1. Deterministic tools first

Search, fetch, parse, diff, render, test — these should be plain functions with schemas, not model calls. An agent that asks a language model to "search the codebase" will hallucinate file names. An agent that calls `symbol_search("authenticate user")` gets ranked, real results. Tools should:

- Take typed arguments and return structured data, never prose.
- Fail loudly with actionable errors, not vague "something went wrong."
- Be idempotent where possible, so a retry is safe.

I keep a short rule of thumb: if I can write a deterministic function in under an hour, I do — and the model only decides *when* to call it.

### 2. Small models for routing, big models for judgment

Not every step needs your flagship model. Classification ("is this a bug report or a feature request?"), intent routing, summarization for context compression, and first-pass triage are all jobs a small, fast model does well at a fraction of the cost. Reserve the large model for the two or three moments where judgment actually matters: choosing a plan, reviewing a draft, deciding whether to ship.

In practice this flips the cost curve. A workflow that runs ten steps with a frontier model on every step can cost 10–50× more than one that uses a small model for seven of those steps — with no measurable quality loss on the steps that remain.

### 3. Human checkpoints at irreversible moments

Read-only exploration can run freely. Anything that writes, sends, deletes, deploys, or spends money gets a checkpoint: the agent produces a plan, a human (or a strict policy check) approves, *then* the tool runs. This single rule prevents the majority of embarrassing agent incidents I've seen. It also makes the agent feel trustworthy to the people who have to own its output.

## Context is the real budget

The most underrated skill in agent engineering is context management. A long run accumulates tool output until the model is drowning in stale file contents. My defaults:

- **Summarize aggressively.** When a tool result is large, distill it to the decision-relevant facts before it re-enters context.
- **Index, don't dump.** Prefer searchable indexes (BM25, embeddings, symbol tables) over pasting whole files.
- **Keep a plan file.** A short, always-visible plan lets the agent recover after compaction instead of re-deriving intent from a scrolling transcript.

Think of context like memory in a performance-critical app: cache the hot path, evict ruthlessly, and never let the working set grow unboundedly.

## A minimal workflow that ships

Here is the shape I reach for first, whether the agent writes code, researches, or triages support tickets:

1. **Plan** — produce a short, checkable plan before touching anything.
2. **Gather** — deterministic tools collect facts (search, fetch, inspect).
3. **Draft** — the model proposes the change, patch, or answer.
4. **Verify** — run the cheapest real check: tests, type checks, a diff review, a second model pass.
5. **Checkpoint** — a human or policy gate approves irreversible steps.
6. **Act & record** — execute, then log what actually happened so the next run starts from truth.

Each step is small, observable, and resumable. When something fails, you know exactly which step failed and why — which is the difference between debugging and prayer.

## What I would tell my first agent project

Start with one workflow, not a framework. Measure cost per successful task, not just accuracy. Treat every tool as an API you must maintain. And remember: the best agent system I've built isn't the one that needs the agent the least — it's the one where the agent's judgment is spent only on the decisions that genuinely need judgment.

The models will keep getting smarter. The discipline around them — deterministic tools, small models for routing, checkpoints before action — is what turns a demo into something you can actually put in front of users.
