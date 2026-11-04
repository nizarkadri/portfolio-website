---
title: AI-Assisted Dev Workflow & MCP Tooling
description: Agent-assisted engineering workflow with Pi Owl MCP agent, a custom Flutter MCP server, and an upstream Pi grapheme-width fix.
summary: OpenRouter-routed coding-agent workflows with task queuing, context guard, and open-source terminal-rendering contributions.
imageUrl: /images/Projects/ai-assisted-dev-workflow.jpg
slug: ai-assisted-dev-workflow
technologies: ['Pi', 'OpenRouter', 'MCP', 'Flutter', 'TypeScript']
featured: false
order: 8
repoUrl: https://github.com/earendil-works/pi/pull/5155
year: '2025'
status: Live
impact: Faster plan-driven development with agent-reviewed commits
highlights:
  - Pi Owl MCP agent with task queuing, cancellation, request logging, and recursion protection
  - Flutter MCP server automating lifecycle, emulator routing, hot reload, and analyze/test
  - 'Upstream Pi PR #5155: grapheme-accurate terminal-width rendering'
---

## 🔬 Project Overview

An AI-assisted development workflow built around concurrent coding-agent sessions (Pi, herdr) with OpenRouter model routing — stronger models for reasoning/review, lower-cost models for simpler tasks — plus a context guard that restarts agents at 80% context usage.

**🎯 Problem**: AI coding agents need orchestration, guardrails, and tooling to turn prompt engineering and context management into repeatable engineering throughput.

## ✨ Key Features

🗂️ **Task Queuing** - Pi Owl MCP agent with queue, cancellation, request logging, and recursion protection
📱 **Flutter MCP Server** - App lifecycle orchestration, emulator routing, hot reload, log capture, automated `flutter analyze` and test execution across WSL→Windows
📋 **Plan-Driven Workflow** - Implementation plans include test cases; reviewer agents run tests before commits; risky diffs manually reviewed
🛡️ **Context Guard** - Automatic restart at 80% context usage
🔧 **Upstream Contribution** - Tab-aware TUI overlay compositing + grapheme-accurate width measurement (splitGraphemes/visibleWidth/truncateToWidth) with regression tests

## 🛠️ Technical Implementation

**Routing**: Pi + Claude + Cursor + herdr with OpenRouter; local LLMs + OpenRouter APIs with prompt engineering, tool calling, and agent orchestration
**Upstream**: https://github.com/earendil-works/pi/pull/5155 — fixes terminal-width overflow (issue #5157)

## 🚀 Performance Metrics

| Metric | Achievement |
|--------|-------------|
| **Context guard** | Restart at 80% context usage |
| **AI mobile testing** | Pi Owl supports AI-assisted mobile test automation workflows |

## 🔗 Project Links

Upstream PR: https://github.com/earendil-works/pi/pull/5155
