// app/projects/page.tsx
import { Metadata } from 'next'
import { getSortedProjectsData } from '../../lib/projects'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Projects - AI Products, Built End to End',
  description: 'AI products built end to end: RAG assistants grounded in real documents, a screenshot-to-palette app on a queue-based Google Cloud backend, computer-vision screening, and a Flutter community app with vision-driven UI tests.',
  keywords: 'AI engineer portfolio, AI projects, RAG, LLM applications, Google Gemini, LangChain, ChromaDB, Google Cloud Run, Cloud Tasks, computer vision, Flutter, Next.js, full-stack AI',
  openGraph: {
    title: 'Projects - Nizar Kadri Portfolio',
    description: 'AI products built end to end, from the model call to the cloud backend.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects - Nizar Kadri Portfolio',
    description: 'AI products built end to end, from the model call to the cloud backend.',
    images: ['/og-image.jpg'],
  },
}

export default async function ProjectsPage() {
  const projects = await getSortedProjectsData()

  return <ProjectsClient projects={projects} />
}
