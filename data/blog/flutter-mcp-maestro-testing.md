---
title: "Flutter, MCP, and Maestro: Mobile Testing That Actually Catches Regressions"
date: 2025-03-18
slug: flutter-mcp-maestro-testing
excerpt: "How I use MCP tooling and Maestro flows to test Flutter apps end-to-end, deterministic waits, honest assertions, and CI that fails on real bugs instead of flakes."
tags: ['Flutter', 'Maestro', 'MCP', 'Mobile', 'Testing']
author: Nizar Kadri
readingTime: 7
featured: false
---

## UI tests are where good intentions go to die

Every mobile team says it will write end-to-end tests. Few keep them green for long. The usual causes are familiar: tests that tap coordinates instead of finding elements, assertions that pass whether or not the feature works, and setup steps so fragile that a redesign breaks the suite instead of a regression.

Working on CondoConnect — a Flutter app for condo living, from payments to maintenance requests — forced a better discipline. Combined with MCP (Model Context Protocol) tooling, where an agent can drive device and test harnesses through typed tools, I rebuilt our testing approach around three rules: **find elements semantically, wait deterministically, and assert outcomes users care about**.

## Rule 1: Semantic selectors, never coordinates

Maestro flows should locate elements the way a user perceives them — by visible text, content description, or accessibility identifier — not by x/y coordinates. Coordinates break on every screen size and layout tweak. Text and identifiers survive redesigns, which is exactly the point: a layout change should not fail your regression suite, but a broken feature should.

In Flutter this means being deliberate about `text`, `semanticsLabel`, and `key` values on anything a test needs to find. Accessibility work and testability work turn out to be the same work — which is a nice bonus.

## Rule 2: Wait for state, not for time

`sleep(3000)` is not a synchronization strategy. The reliable pattern is to wait for a condition: a screen title appears, a list item renders, a network-dependent spinner disappears. Maestro's `assertVisible` and conditional waits express this directly. Where a flow must tolerate slow backends, wait for the *outcome* element, with a generous timeout, rather than guessing a fixed delay.

The payoff is speed as well as stability. Conditional waits finish as soon as the app is ready; fixed sleeps always wait the full amount. A suite that waits on state runs faster *and* flakes less.

## Rule 3: Assert the user's outcome

A test that navigates the flow but never checks the result is theater. Good assertions match the feature's promise:

- After submitting a maintenance request, assert the confirmation and the ticket appearing in the list.
- After a payment flow, assert the updated balance or receipt — not just that the button was tappable.
- After login, assert the home screen's expected content, not merely the absence of an error.

I also assert the negative path once per critical flow: wrong credentials show the error state. Bugs love untested error paths.

## MCP's role: agents as test operators

MCP changes the economics of this work. With typed tools for launching flows, reading logs, and inspecting results, an agent can author a Maestro flow from a plain-English scenario, run it, read the failure, and iterate — without a human babysitting each step. The harness keeps orchestration in the parent session; the helper executes bounded tasks: write this flow, run that flow, triage this log.

That division matters. The agent is good at translating "test that a resident can submit a maintenance request" into concrete steps and assertions. The human (or parent agent) owns the decision of what deserves testing. And when a flow flakes, the log-triage loop — reproduce, inspect, tighten the wait, re-run — is exactly the kind of bounded debugging agents do well.

## A flow template I reuse

Every flow I write follows the same skeleton:

1. **Preconditions** — fresh install or seeded state, stated explicitly.
2. **Happy path** — semantic navigation, conditional waits, outcome assertions.
3. **One negative path** — the most likely user error for that feature.
4. **Evidence** — screenshots or logs on failure, so CI failures are debuggable without re-running locally.

Keep flows short. One scenario per file. A 200-line flow is three bugs wearing a trench coat.

## What changed

Before: flaky suite, ignored failures, manual QA as the real safety net. After: deterministic flows, semantic selectors, outcome assertions, and agent-assisted authoring — with CI failing on real regressions instead of layout trivia. Mobile testing stopped being a chore and started being the place where regressions actually get caught.

The tools keep evolving — Flutter's own widget tests, Maestro, MCP harnesses — but the discipline is stable: find semantically, wait for state, assert outcomes. Everything else is plumbing.
