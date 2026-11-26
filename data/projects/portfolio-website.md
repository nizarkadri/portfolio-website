---
title: Portfolio Website
description: A scroll-driven Next.js, React and TypeScript portfolio with live 3D scenes, shipped as a container to Google Cloud Run through a Cloud Build CI/CD pipeline that builds and deploys on every push to GitHub.
summary: Next.js portfolio with Three.js scenes, deployed to Google Cloud Run by a push-triggered Cloud Build pipeline.
imageUrl: /images/Projects/portfolio-website.webp
slug: portfolio-website
technologies: ['Next.js', 'React', 'TypeScript', 'Three.js', 'Docker', 'Google Cloud Run', 'Cloud Build', 'Artifact Registry', 'Google Analytics']
featured: true
order: 2
repoUrl: https://github.com/nizarkadri/portfolio-website
year: '2026'
status: Live
impact: Every push to GitHub ships to production with no manual steps
highlights:
  - Push-triggered Cloud Build CI/CD that builds a Docker image, stores it in Artifact Registry and deploys it to Cloud Run
  - Scroll-driven Three.js scenes for the landing, work and experience pages
  - Markdown-powered projects and blog, with Google Analytics and Core Web Vitals tracking
---

## About the Project

This site is where my projects, experience and writing live. I built it end to end: the front end, the server routes behind it, and the pipeline that puts it on Google Cloud.

## Key Features

* **3D, scroll-driven pages:** Three.js scenes with smooth scrolling (Lenis) that move with the reader instead of stopping them.
* **Markdown content:** projects and blog posts are Markdown files with front matter, so adding one needs no code change.
* **Contact form:** validated on both sides with Zod and React Hook Form, rate-limited, and delivered by email.
* **Analytics:** Google Analytics page views plus Core Web Vitals reported as events.
* **Responsive:** separate phone layouts, including swiping between projects.

## Technologies Used

* Next.js, React and TypeScript
* Three.js and Lenis
* Tailwind CSS
* Zod and React Hook Form
* Docker
* Google Cloud Run, Cloud Build and Artifact Registry
* Google Analytics

## Deployment and CI/CD

The site runs on Google Cloud Run. A Cloud Build trigger on the GitHub repository starts a build on every push: a multi-stage Dockerfile installs production dependencies, builds the Next.js app and copies only what the runtime needs into a small image. The image is stored in Artifact Registry and deployed to Cloud Run as a new revision, so a merged change reaches production with no manual steps.
