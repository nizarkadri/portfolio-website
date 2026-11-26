// app/lib/metadata.ts
import type { Metadata } from 'next';

function getBaseUrl() {
  // Primary: Use environment variable (set in CI/CD)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // Google Cloud Run: Auto-detect service URL if available
  if (process.env.GOOGLE_CLOUD_RUN_SERVICE && process.env.GOOGLE_CLOUD_RUN_REGION) {
    return `https://${process.env.GOOGLE_CLOUD_RUN_SERVICE}-${process.env.GOOGLE_CLOUD_RUN_REGION}.a.run.app`
  }
  
  // Production fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://nizarsway.com'
  }
  
  // Development fallback
  return 'http://localhost:3000'
}

// Complete SEO metadata configuration
export const siteMetadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'Nizar Kadri - Full-Stack AI Engineer',
    template: '%s | Nizar Kadri Portfolio'
  },
  description: 'Full-Stack AI Engineer in Toronto building AI products end to end: RAG assistants, agent workflows, MCP developer tools, and the Next.js, Python and Google Cloud systems that run them.',
  keywords: 'AI engineer, full-stack AI engineer, LLM applications, RAG, AI agents, agent orchestration, context engineering, prompt engineering, MCP server, AI developer tools, Next.js, TypeScript, Python, Google Cloud Run, full stack developer, Toronto',
  authors: [{ name: 'Nizar Kadri' }],
  creator: 'Nizar Kadri',
  publisher: 'Nizar Kadri',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getBaseUrl(),
    title: 'Nizar Kadri - Full-Stack AI Engineer',
    description: 'I build AI products end to end: RAG assistants, agent workflows, MCP developer tools, and the cloud backends that run them.',
    siteName: 'Nizar Kadri Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nizar Kadri - Full-Stack AI Engineer, Toronto',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nizar Kadri - Full-Stack AI Engineer',
    description: 'I build AI products end to end: RAG assistants, agent workflows, MCP developer tools, and the cloud backends that run them.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0b0f15' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  category: 'portfolio',
  // Dark Reader leaves a page alone when it carries this
  other: { 'darkreader-lock': 'true' },
};