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
    default: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    template: '%s | Nizar Kadri Portfolio'
  },
  description: 'Full Stack Developer specializing in React, Node.js, Python, and cloud technologies. Experienced in building scalable web applications, AI-powered solutions, and modern responsive designs.',
  keywords: 'full stack developer, software engineer, React developer, Node.js, Python, cloud computing, web development, AI applications, portfolio',
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
    title: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    description: 'Full Stack Developer specializing in React, Node.js, Python, and cloud technologies. Building innovative web applications and AI-powered solutions.',
    siteName: 'Nizar Kadri Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nizar Kadri - Full Stack Developer & Software Engineer',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    description: 'Full Stack Developer specializing in React, Node.js, Python, and cloud technologies.',
    images: ['/og-image.png'],
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
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#B8E62D' },
    ],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  category: 'portfolio',
};