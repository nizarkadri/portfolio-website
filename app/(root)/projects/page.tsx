// app/projects/page.tsx
import { Metadata } from 'next'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Projects - Innovative Software Solutions',
  description: 'Explore my portfolio of innovative software projects including AI-powered applications, full-stack web solutions, and modern responsive designs. Built with React, Node.js, Python, and cutting-edge technologies.',
  keywords: 'software projects, web development portfolio, React projects, Node.js applications, AI projects, full-stack development, innovative solutions',
  openGraph: {
    title: 'Projects - Nizar Kadri Portfolio',
    description: 'Explore innovative software projects and applications built with modern technologies.',
    images: ['/images/projects-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects - Nizar Kadri Portfolio',
    description: 'Explore innovative software projects and applications built with modern technologies.',
    images: ['/images/projects-og.jpg'],
  },
}

export default function ProjectsPage() {
  return <ProjectsClient />
}