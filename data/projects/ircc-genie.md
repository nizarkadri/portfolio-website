---
title: "IRCC Genie: Canadian Immigration RAG Assistant"
description: A RAG MVP answering questions about Canada's Federal Skilled Worker six selection factors, grounded in official IRCC documentation.
summary: Python RAG pipeline with Scrapy scraping, ChromaDB retrieval, and Gemini answers for immigration policy questions.
imageUrl: /images/Projects/ircc-genie.webp
slug: ircc-genie
technologies: ['Python', 'Scrapy', 'ChromaDB', 'HuggingFace', 'Gemini', 'pytest']
featured: false
order: 5
repoUrl: https://github.com/nizarkadri/IRCC_Genie
year: '2024'
status: Live
impact: Grounds immigration answers in official IRCC documentation
highlights:
  - Answers Federal Skilled Worker six selection factors from official IRCC documentation
  - Scrapy crawler → chunking/embedding pipeline → semantic search → Gemini answers
  - Hallucination-resistant prompt engineering with pytest coverage
---

## 🔬 Project Overview

A RAG MVP answering questions about Canada's Federal Skilled Worker (FSW) program's six selection factors, grounded in official IRCC documentation — helping candidates get current policy information without paying a lawyer.

**🎯 Problem**: Immigration policy information is scattered across official pages and hard to query in plain language.

## ✨ Key Features

🕷️ **IRCC Scraping** - Scrapy crawler extracts official IRCC pages (`ircc_crawler`)
🔎 **Semantic Search** - ChromaDB vector store with HuggingFace embeddings
🤖 **Grounded Answers** - Google Gemini API (gemini-pro, temperature 0.3) with hallucination-resistant prompt engineering
✅ **Tested Pipeline** - pytest test suite with environment-based config

## 🛠️ Technical Implementation

**Build log**: Day 1 foundation + data extraction + tests → Day 2 vector store + chunking/embedding pipeline + semantic search → Day 3 Gemini integration + error handling/fallbacks
**Stack**: Python 3.11+, Scrapy, ChromaDB, HuggingFace embeddings, Google Gemini API, pytest

## 🚀 Performance Metrics

| Metric | Achievement |
|--------|-------------|
| **Scope** | Federal Skilled Worker six selection factors |
| **Grounding** | Official IRCC documentation |

## 🔗 Project Links

Code: https://github.com/nizarkadri/IRCC_Genie
