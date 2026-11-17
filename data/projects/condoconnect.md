---
title: "Condo Social: Flutter Condo Community App"
description: A cross-platform Flutter app for condo residents with community feed, marketplace, direct messages, issue reporting, and polls.
summary: Residents-only condo community platform with Material 3 theming, Sentry crash reporting, and Supabase RLS.
imageUrl: /images/Projects/condoconnect.webp
slug: condoconnect
technologies: ['Flutter', 'Dart', 'Supabase', 'Sentry', 'Material 3', 'Maestro']
featured: true
order: 1
repoUrl: https://github.com/nizarkadri/Flutter-CondoApp
year: '2025'
status: Live
impact: Private residents-only community with 50+ Material 3 theme colors
highlights:
  - Discussion board with polls + voting, marketplace gallery, DMs, and issue reporting
  - Material 3 with 50+ predefined colors, light/dark modes, and semantic error/success/warning/info colors
  - Supabase Row Level Security, Sentry crash reporting, Maestro UI tests with vision models
---

## 🔬 Project Overview

A cross-platform Flutter app for condo residents with a community feed, direct messages, marketplace, and issue reporting — designed for private, residents-only communities.

**🎯 Problem**: Condo residents lack a single private channel for community discussion, buy/sell, and building issue reporting.

## ✨ Key Features

💬 **Discussion Board** - Posts, questions, and polls with voting
🛍️ **Marketplace** - Buy/sell gallery layout
💌 **Direct Messages** - Private resident messaging
🛠️ **Issue Reporting** - Structured building issue reports
👤 **Resident Profiles** - Residency status (Tenant/Owner) and tenure instead of unit numbers
🎨 **Dynamic Theming** - Material 3 with 50+ predefined colors, light/dark modes, semantic colors, interactive states (selected/hover/active), specialized colors for polls/marketplace/notifications

## 🛠️ Technical Implementation

**Mobile**: Flutter / Dart, auto-hiding bottom navigation + top header on scroll, full-width search bar with category filtering, pull-to-refresh
**Backend**: Supabase with Row Level Security (RLS) — DB technical audit and Phase-3 database plan
**Quality**: Sentry crash reporting, structured logging, Maestro UI tests with vision models

## 🚀 Performance Metrics

| Metric | Achievement |
|--------|-------------|
| **Theme colors** | 50+ predefined colors for light/dark modes |
| **Observability** | Sentry crash reporting + structured logging |

## 🔧 Technical Challenges & Solutions

**Residents-only privacy** — Supabase RLS follow-ups ensure users only see their own community's data; profiles show residency status and tenure rather than unit numbers.

## 🔗 Project Links

Code: https://github.com/nizarkadri/Flutter-CondoApp
