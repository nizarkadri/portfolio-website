import { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About Me - Full Stack Developer Journey',
  description: 'Learn about my journey as a Full Stack Developer, my passion for technology, problem-solving approach, and the experiences that shaped my career in software engineering.',
  keywords: 'about me, full stack developer, software engineer, developer journey, programming experience, technology passion, problem solving',
  openGraph: {
    title: 'About Nizar Kadri - Full Stack Developer',
    description: 'Learn about my journey as a Full Stack Developer and passion for technology.',
    images: ['/images/about-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Nizar Kadri - Full Stack Developer',
    description: 'Learn about my journey as a Full Stack Developer and passion for technology.',
    images: ['/images/about-og.jpg'],
  },
}

export default function AboutPage() {
  return <AboutClient />
}
