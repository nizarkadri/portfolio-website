'use client';

import React from 'react';


import dynamic from 'next/dynamic';
import ParallaxImage from '../../../components/ParallaxImage';  
import {useIsMobile} from "../../../app/hooks/useMobile";
// Dynamically import the components with SSR disabled since they use browser APIs
const ChessProfile = dynamic(() => import('../../../components/ChessProfile'), { ssr: false });
const DuolingoProfile = dynamic(() => import('../../../components/DuolingoProfile'), { ssr: false });
const LeetCodeProfile = dynamic(() => import('../../../components/LeetCodeProfile'), { ssr: false });

export default function AboutPage() {
  const isMobile = useIsMobile();
  return (
    <div className="relative h-[300vh] ">
      
    {/* Background Image */}
    <ParallaxImage image="/images/Potraits/IMG-20250411-WA0021.jpg" isMobile={isMobile}>
      
    </ParallaxImage>

   
    <div className="min-h-screen py-20 bg-transparent">
      <div className="container mx-auto px-4">
          
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
