'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ParallaxImage from '../../../components/ParallaxImage';  
import {useIsMobile} from "../../../app/hooks/useMobile";
// Dynamically import the components with SSR disabled since they use browser APIs
const ChessProfile = dynamic(() => import('../../../components/ChessProfile'), { ssr: false });
const DuolingoProfile = dynamic(() => import('../../../components/DuolingoProfile'), { ssr: false });
const LeetCodeProfile = dynamic(() => import('../../../components/LeetCodeProfile'), { ssr: false });
const title = ["Beyond","Work"]
export default function AboutPage() {
  const isMobile = useIsMobile();
  return (
    <div className="relative h-[300vh] ">
      
    {/* Background Image */}
    <ParallaxImage image="/images/Potraits/IMG-20250411-WA0021.jpg" isMobile={isMobile}>
      
    </ParallaxImage>

    {/* <div className="fixed inset-0 -z-10">
      <Image
        src="/images/Potraits/IMG-20250411-WA0021.jpg"
        alt="Background"
        fill
        priority
        quality={90}
        className="object-cover object-center"
        style={{ willChange: 'transform' }}
      />
    </div> */}
    <div className="min-h-screen py-20 bg-transparent">
      <div className="container mx-auto px-4">
        {/* <h1 className="text-5xl md:text-7xl font-bold mb-10 text-white">Nizar K.</h1> */}
        
        
        {/* Beyond Work Section with Chess.com, Duolingo, and LeetCode */}
        <div className="mt-20">
          
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ChessProfile />
            <DuolingoProfile />
            <LeetCodeProfile />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
