---
title: UI Palette Explorer (colorBrain)
description: A full-stack web app that turns UI screenshots into hundreds of live-previewable color palettes with AI-generated recreations rendered in sandboxed Chromium.
summary: Screenshot-to-color-palette tool with Kanban role correction, Space-cycle exploration, and CSS variables / JSON export.
imageUrl: /images/Projects/ui-palette-explorer.webp
slug: ui-palette-explorer
technologies: ['Google Cloud Run', 'Cloud Tasks', 'Firestore', 'Chromium', 'TypeScript', 'AI']
featured: true
order: 3
repoUrl: https://github.com/nizarkadri/palette-mvp
year: '2024'
status: Live
impact: Hundreds of live-previewable palettes per screenshot
highlights:
  - Upload screenshot → AI recreates static HTML/CSS → groups into Primary / Secondary / Accent roles
  - Kanban-style panel to correct categorization, press Space to cycle palettes instantly
  - Export as CSS variables or JSON tokens after live preview
---

## 🔬 Project Overview

"Coolors, but applied to the user's own real UI screenshot." Upload a screenshot and the app recreates a simplified static HTML/CSS version of the interface, identifies UI parts (backgrounds, cards, buttons, headings, links, captions, icons), and groups them into color roles.

**🎯 Problem**: Designers and developers waste time guessing palettes for existing screens instead of deriving them from real UI.

## ✨ Key Features

🎨 **Role-Based Palettes** - Primary = structural areas/nav/tab bars, Secondary = cards/panels/inputs, Accent = buttons/links/icons/brand marks
🗂️ **Kanban Role Correction** - Drag/correct categorization of UI elements before palette generation
⌨️ **Space-Cycle Exploration** - Press Space to instantly cycle live palettes with live preview
📦 **Developer Export** - Export palette as CSS variables or JSON tokens
🏆 **colorBrain Scoring** - Candidate 5-color UI theme → compatibility score → role-fit score → prototype/taste score → dedupe/rank

## 🛠️ Technical Implementation

**Architecture**: Two-service GCP design — public API + private worker on Cloud Run, Cloud Tasks queue, Firestore
**Rendering**: AI-generated recreations rendered in sandboxed Chromium (untrusted markup isolated from user data)
**Deployed**: Test environment on GCP

## 🚀 Performance Metrics

| Metric | Achievement |
|--------|-------------|
| **Palettes per screenshot** | Hundreds of live-previewable palettes |
| **Generation pipeline** | Compatibility → role-fit → taste → dedupe/rank |

## 🔧 Technical Challenges & Solutions

**Untrusted AI-generated markup** — Separated public API from private worker and rendered recreations in a sandboxed Chromium so generated HTML/CSS never runs with user privileges.

## 🔗 Project Links

Code: https://github.com/nizarkadri/palette-mvp
