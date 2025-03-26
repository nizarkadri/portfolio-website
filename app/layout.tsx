// app/layout.tsx
import type { Metadata } from 'next'
import Navbar from '../components/Navbar';
import './globals.css';
import { Inter } from 'next/font/google'; // Import Inter

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: Define a CSS variable
});

export const metadata: Metadata = {
  title: 'Nizar K - Portfolio',
  description: 'Nizar K\'s Software Engineering Portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body suppressHydrationWarning className="bg-[#0E0E0E] text-soft-white min-h-screen flex flex-col">
        {/* Background grid */}
        <div className="fixed inset-0 bg-[url('/grid-dark.svg')] bg-center opacity-[0.02] pointer-events-none" />
        
        {/* Floating particles */}
        <div className="particle particle-sm top-[15%] left-[10%] animate-float-slow"></div>
        <div className="particle particle-md top-[45%] left-[15%] animate-float"></div>
        <div className="particle particle-lg top-[75%] left-[5%] animate-float-delayed"></div>
        <div className="particle particle-md top-[20%] right-[15%] animate-float-delayed"></div>
        <div className="particle particle-sm top-[60%] right-[10%] animate-float-slow"></div>
        <div className="particle particle-lg top-[80%] right-[20%] animate-float"></div>
        
        <Navbar />
        <main className="container mx-auto px-4 md:px-6 py-8 flex-grow mt-20">
          <div className="fade-in">
            {children}
          </div>
        </main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}