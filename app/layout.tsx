// app/layout.tsx
import type { NextWebVitalsMetric } from 'next/app';
import { Suspense } from 'react';
import Script from 'next/script';
import type { Metadata } from 'next'
import Navbar from '../components/Navbar';
import NewFooter from '../components/NewFooter';
import GlobalResumeButton, { ResumeModalProvider } from '../components/GlobalResumeButton';
// import Analytics from '../components/Analytics';
import AnalyticsTracker from '../components/AnalyticsTracker';
import { GA_TRACKING_ID } from './lib/gtag';
import './globals.css';
import { Inter } from 'next/font/google'; 

import SmoothScroll from '../components/SmoothScroll'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', 
});

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Check if GA is configured
  if (!GA_TRACKING_ID) {
    return;
  }
  
  // Use the gtag function to send event
  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    // The value must be a non-negative integer.
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    // The event label should be unique for each page load.
    event_label: metric.id,
    // Use a non-interaction event to avoid affecting bounce rate.
    non_interaction: true,
  });
}


// Base metadata that can be extended by individual pages
export const metadata: Metadata = {
  title: {
    default: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    template: '%s | Nizar Kadri - Portfolio'
  },
  description: 'Experienced Full Stack Developer specializing in React, Node.js, and modern web technologies. Explore my portfolio of innovative projects including AI-powered applications, responsive web designs, and scalable software solutions.',
  keywords: [
    'Full Stack Developer',
    'Software Engineer', 
    'React Developer',
    'Node.js',
    'JavaScript',
    'TypeScript',
    'Next.js',
    'Web Development',
    'Frontend Developer',
    'Backend Developer',
    'Portfolio',
    'Nizar Kadri',
    'AI Applications',
    'Machine Learning',
    'Responsive Design',
    'Modern Web Technologies'
  ],
  authors: [{ name: 'Nizar Kadri' }],
  creator: 'Nizar Kadri',
  publisher: 'Nizar Kadri',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    description: 'Experienced Full Stack Developer specializing in React, Node.js, and modern web technologies. Explore my portfolio of innovative projects.',
    siteName: 'Nizar Kadri Portfolio',
    images: [
      {
        url: '/images/og-image.jpg', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Nizar Kadri - Full Stack Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nizar Kadri - Full Stack Developer & Software Engineer',
    description: 'Experienced Full Stack Developer specializing in React, Node.js, and modern web technologies.',
    images: ['/images/og-image.jpg'],
    creator: '@nizarkadri', // Replace with your Twitter handle
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
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#B8E62D" />
        <meta name="msapplication-TileColor" content="#B8E62D" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Nizar Kadri",
              "jobTitle": "Full Stack Developer",
              "description": "Experienced Full Stack Developer specializing in React, Node.js, and modern web technologies",
              "url": "https://your-domain.com",
              "sameAs": [
                "https://github.com/nizarkadri",
                "https://linkedin.com/in/nizarkadri", // Replace with your LinkedIn
                "https://twitter.com/nizarkadri" // Replace with your Twitter
              ],
              "knowsAbout": [
                "JavaScript",
                "TypeScript", 
                "React",
                "Node.js",
                "Next.js",
                "Full Stack Development",
                "Software Engineering",
                "Web Development",
                "Machine Learning",
                "AI Applications"
              ],
              "alumniOf": {
                "@type": "EducationalOrganization",
                "name": "Your University" // Replace with your education
              }
            })
          }}
        />
      </head>
      <body className="bg-black text-white overflow-x-hidden">
      {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              onLoad={() => {
                // This signals that the gtag function is now available
                window.dispatchEvent(new Event('gtag_ready'));
              }}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
         {/* <Analytics />  */}
         <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <ResumeModalProvider>
          <SmoothScroll>
            <Navbar />
            <main>
              {children}
            </main>
            <NewFooter />
          </SmoothScroll>
          <GlobalResumeButton />
        </ResumeModalProvider>
      </body>
    </html>
  )
}