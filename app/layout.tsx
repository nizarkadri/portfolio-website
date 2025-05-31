
// app/layout.tsx
import type { Metadata } from 'next'
import Navbar from '../components/Navbar';
import NewFooter from '../components/NewFooter';
import './globals.css';
import { Inter } from 'next/font/google'; 
import FooterOld from '../components/FooterOld';

import SmoothScroll from '../components/SmoothScroll'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', 
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
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning className="bg-black text-soft-white min-h-[100dvh] flex flex-col">
        {/* Floating particles */}
        <div className="particle hidden sm:block particle-sm top-[15%] left-[10%] animate-float-slow"></div>
<div className="particle hidden sm:block particle-md top-[45%] left-[15%] animate-float"></div>
<div className="particle hidden sm:block particle-lg top-[75%] left-[5%] animate-float-delayed"></div>
<div className="particle hidden sm:block particle-md top-[20%] right-[15%] animate-float-delayed"></div>
<div className="particle hidden sm:block particle-sm top-[60%] right-[10%] animate-float-slow"></div>
<div className="particle hidden sm:block particle-lg top-[80%] right-[20%] animate-float"></div>
        
        <Navbar />
        <main className="container  mx-auto px-0 md:px-6 py-2 md:py-8 flex-grow mt-10 md:mt-20 overflow-x-hidden">
          {/* <ThreeScene /> */}
          <div className="fade-in">
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </div>
        </main>
        {/* <FooterOld /> */}
        <NewFooter />
      </body>
    </html>
  );
}