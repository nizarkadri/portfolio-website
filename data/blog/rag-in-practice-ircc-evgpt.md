---
title: "RAG in Practice: IRCC Genie, EV-GPT, and the Retrieval Details That Matter"
date: 2025-06-02
slug: rag-in-practice-ircc-evgpt
excerpt: "Citation grounding, chunking strategy, and evaluation loops — what actually separates a useful RAG assistant from a confident hallucinator, from two production builds."
tags: ['RAG', 'LLM', 'Python', 'IRCC', 'EV-GPT']
author: Nizar Kadri
readingTime: 10
featured: false
---

## RAG is easy to demo and hard to trust

Retrieval-Augmented Generation has a seductive pitch: point a language model at your documents, and it answers questions with your facts. The demo takes an afternoon. The trust takes months. I've built RAG systems in two very different domains — **IRCC Genie**, an assistant for Immigration, Refugees and Citizenship Canada guidance material, and **EV-GPT**, an expert system over electric-vehicle technical documentation — and the lessons rhyme even though the content couldn't be more different.

The model was never the bottleneck. Retrieval quality, grounding discipline, and evaluation were. This post is about those three.

## 1. Chunking is a product decision, not an implementation detail

How you split documents determines what the system can ever answer. Chunk by legal section or technical spec heading and your retrieval units match how users actually ask questions. Chunk by fixed character count and you'll slice a procedure in half, then wonder why answers are incoherent.

What worked for me:

- **Split on structure first** (headings, sections, list items), then on size. A chunk should be one idea.
- **Carry metadata with every chunk**: document title, section path, effective date, source URL. Metadata is what makes citations and freshness checks possible later.
- **Overlap sparingly.** A small overlap helps context continuity, but heavy overlap floods the index with near-duplicates and dilutes the ranking.

For EV-GPT, technical spec sheets needed finer chunks because users ask about one parameter at a time. For IRCC guidance, coarser section-level chunks won, because users ask "what happens if…" about a whole procedure. Same stack, opposite chunking — because the questions differ.

## 2. Grounding is a behavior you enforce, not a hope

A RAG answer without a citation is a rumor. I enforce grounding at three levels:

- **Prompt level**: the model is instructed to answer only from retrieved context, to say "I can't find that in the provided documents" rather than improvise, and to cite chunk IDs for every factual claim.
- **Retrieval level**: if the top retrieved chunks are weakly related (low similarity), the system should abstain or ask a clarifying question instead of handing the model irrelevant text and hoping it won't confabulate.
- **Presentation level**: every answer shows its sources. For IRCC-style content, where a wrong calm answer has real consequences, visible citations are non-negotiable.

The abstention path is the one most teams skip, and it's the one users remember. A system that honestly says "not covered in these documents" builds more trust than one that fluently invents an answer.

## 3. Evaluation: golden sets beat vibes

"Seems to work" is not an evaluation. For both projects I built small golden sets: real questions with known-good answers and required sources. Then I measured:

- **Retrieval recall**: is the right chunk in the top-k? If not, no prompt will save you.
- **Faithfulness**: do the answer's claims actually appear in the cited chunks?
- **Abstention accuracy**: does the system decline questions the documents don't cover?

Most quality problems I found traced back to retrieval, not generation. Fixing chunking and ranking improved answers more than any prompt rewrite. That ordering surprises people: in RAG, **retrieval is the product**, generation is the presentation layer.

## Deployment notes

Both systems shipped with boring, proven plumbing: ChromaDB for local vector search, LangChain for orchestration, Streamlit for the interface, Docker and AWS for deployment. The stack matters less than the discipline: version your index, log every query and its retrieved chunks, and keep a feedback channel so real user questions become tomorrow's golden set.

## The checklist I now use for any RAG build

1. Chunk on structure; attach metadata to every chunk.
2. Measure retrieval recall before tuning prompts.
3. Force citations; display them.
4. Build an abstention path and test it.
5. Keep a golden set of real questions; grow it from logs.
6. Log retrieval, not just answers — that's where the debugging lives.

RAG doesn't make a model knowledgeable. It makes a model's knowledge *auditable*. In regulated, high-stakes domains like immigration and technical documentation, that auditability is the entire value proposition — and it lives or dies in the retrieval details nobody wants to write about.
