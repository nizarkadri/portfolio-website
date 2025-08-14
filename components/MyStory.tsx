// src/components/MyStory.tsx

'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { storyData, StoryChapter } from './StoryData';

// --- COMPONENTS ---

const Starfield: React.FC = () => (
	<div className="absolute inset-0 -z-20">
		<div className="absolute inset-0 bg-stars" />
		<div className="absolute inset-0 bg-twinkling" />
	</div>
);

const TimelineConnector: React.FC<{ isLast: boolean; progress: any }> = ({ isLast, progress }) => {
	if (isLast) return null;
	
	return (
		<div className="absolute bottom-0 inset-x-0 translate-y-full z-0 flex justify-center">
			<div className="w-0.5 h-20 bg-gradient-to-b from-[#B8E62D]/60 via-[#B8E62D]/30 to-transparent relative">
				<motion.div 
					className="absolute top-0 left-0 w-full bg-[#B8E62D] shadow-[0_0_8px_rgba(184,230,45,0.6)]"
					style={{ height: useTransform(progress, [0, 1], ['0%', '100%']) }}
				/>
				{/* Animated dot */}
				<motion.div 
					className="absolute w-2 h-2 bg-[#B8E62D] rounded-full left-1/2 -translate-x-1/2 shadow-[0_0_12px_rgba(184,230,45,0.8)]"
					style={{ top: useTransform(progress, [0, 1], ['0%', '100%']) }}
					animate={{ scale: [1, 1.2, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
			</div>
		</div>
	);
};

// Client-only dynamic cards for the Beyond Work section
const ChessProfile = dynamic(() => import('./ChessProfile'), { ssr: false });
const DuolingoProfile = dynamic(() => import('./DuolingoProfile'), { ssr: false });
const LeetCodeProfile = dynamic(() => import('./LeetCodeProfile'), { ssr: false });

const BeyondWorkSection: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, margin: '-100px' });

    return (
        <section className="relative w-full py-16 md:py-24 z-20">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    ref={ref}
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold text-white mb-4"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                    >
                        Beyond <span className="text-[#B8E62D]">Work</span>
                    </motion.h2>
                    <motion.div
                        className="w-24 h-1 bg-[#B8E62D] mx-auto mb-6 rounded-full"
                        initial={{ width: 0, opacity: 0 }}
                        animate={isInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <motion.p
                        className="text-gray-400 text-lg max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Here&apos;s what keeps me motivated and challenged outside of development
                    </motion.p>
                </motion.div>

                {/* Profiles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.2 }}>
                        <ChessProfile />
                    </motion.div>
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.2 }}>
                        <DuolingoProfile />
                    </motion.div>
                    <motion.div className="md:col-span-2 lg:col-span-1" whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.2 }}>
                        <LeetCodeProfile />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const ManifestoSection: React.FC<{ manifesto: StoryChapter }> = ({ manifesto }) => {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { margin: "-30% 0px -30% 0px", once: false });

	return (
		<motion.section
			ref={ref}
			className="relative py-20 md:py-32"
			initial={{ opacity: 0 }}
			animate={isInView ? { opacity: 1 } : { opacity: 0 }}
			transition={{ duration: 1 }}
		>
			{/* Background accent */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B8E62D]/[0.02] to-transparent" />
			
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-5xl mx-auto text-center">
					{/* Title */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
							{manifesto.title}
						</h2>
						{manifesto.subtitle && (
							<p className="text-xl md:text-2xl text-[#B8E62D] mb-12">
								{manifesto.subtitle}
							</p>
						)}
					</motion.div>

					{/* Principles Grid */}
					{manifesto.principles && (
						<motion.div
							className="grid md:grid-cols-3 gap-8 mb-16"
							initial={{ opacity: 0, y: 40 }}
							animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
							transition={{ duration: 0.8, delay: 0.4 }}
						>
							{manifesto.principles.map((principle, i) => (
								<motion.div
									key={i}
									className="relative p-6 border border-[#B8E62D]/20 rounded-xl bg-black/50 hover:border-[#B8E62D]/40 transition-all duration-300"
									initial={{ opacity: 0, y: 20 }}
									animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
									transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
								>
									<div className="w-12 h-12 bg-[#B8E62D] rounded-full flex items-center justify-center text-black font-bold text-xl mb-4 mx-auto">
										{i + 1}
									</div>
									<h3 className="text-xl font-semibold text-white mb-3">{principle.title}</h3>
									<p className="text-gray-300 leading-relaxed">{principle.text}</p>
								</motion.div>
							))}
						</motion.div>
					)}

					{/* Content */}
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, y: 30 }}
						animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
						transition={{ duration: 0.8, delay: 0.8 }}
					>
						{manifesto.content.map((paragraph, i) => (
							<p key={i} className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
								{paragraph}
							</p>
						))}
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
};

const StoryStep: React.FC<{ chapter: StoryChapter; index: number; isLast: boolean }> = ({ chapter, index, isLast }) => {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { margin: "-30% 0px -30% 0px", once: false });
	
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start end', 'end start']
	});

	const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.9]);
	const y = useTransform(scrollYProgress, [0, 1], ['100px', '-100px']);

	return (
		<motion.div
			ref={ref}
			className="relative mb-32 last:mb-0"
			initial={{ opacity: 0, y: 80 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
			transition={{ duration: 0.8, delay: index * 0.2 }}
		>
			{/* Step Number */}
			<motion.div 
				className="absolute -top-8 inset-x-0 z-20 flex justify-center"
				initial={{ scale: 0 }}
				animate={isInView ? { scale: 1 } : { scale: 0 }}
				transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
			>
				<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8E62D] to-[#9ACD32] flex items-center justify-center shadow-[0_0_30px_rgba(184,230,45,0.4)] border-4 border-black">
					<span className="text-black font-bold text-lg">{index + 1}</span>
				</div>
			</motion.div>

			{/* Content Card */}
			<motion.div
				style={{ opacity, scale, y }}
				className="relative max-w-4xl mx-auto"
			>
				<div className="relative group">
					{/* Prominent embossed black card with subtle green border */}
					<div className={`relative rounded-2xl bg-black border border-[#B8E62D]/30 p-8 md:p-12 transition-all duration-300 shadow-[inset_0_4px_8px_rgba(255,255,255,0.15),inset_0_-4px_8px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.6)] hover:shadow-[inset_0_6px_12px_rgba(255,255,255,0.2),inset_0_-6px_12px_rgba(0,0,0,0.8),0_12px_24px_rgba(0,0,0,0.8)] hover:border-[#B8E62D]/50`}>
						
						{/* Content */}
						<div className="space-y-6">
							<div className="text-center">
								<motion.h2 
									className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-white"
									initial={{ opacity: 0, y: 20 }}
									animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
									transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
								>
									{chapter.title}
								</motion.h2>
								{chapter.subtitle && (
									<motion.h3 
										className="text-xl md:text-2xl font-medium mb-6 text-[#B8E62D]"
										initial={{ opacity: 0, y: 20 }}
										animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
										transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
									>
										{chapter.subtitle}
									</motion.h3>
								)}
							</div>

							<motion.div 
								className="space-y-6"
								initial={{ opacity: 0 }}
								animate={isInView ? { opacity: 1 } : { opacity: 0 }}
								transition={{ duration: 0.8, delay: index * 0.2 + 0.6 }}
							>
								{chapter.principles && (
									<div className="space-y-4">
										{chapter.principles.map((principle, i) => (
											<motion.div
												key={i}
												className="relative border-l-2 border-[#B8E62D] pl-6 py-2 hover:border-l-4 transition-all duration-200"
												initial={{ opacity: 0, x: -30 }}
												animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
												transition={{ duration: 0.5, delay: index * 0.2 + 0.7 + i * 0.1 }}
											>
												<h4 className="font-semibold text-white text-lg mb-2">{principle.title}</h4>
												<p className="text-gray-300 leading-relaxed">{principle.text}</p>
											</motion.div>
										))}
									</div>
								)}
								
								<div className="space-y-6">
									{chapter.content.map((paragraph, i) => (
										<motion.p 
											key={i}
											className="text-lg text-gray-300 leading-relaxed text-center"
											initial={{ opacity: 0, y: 20 }}
											animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
											transition={{ duration: 0.6, delay: index * 0.2 + 0.8 + i * 0.1 }}
										>
											{paragraph}
										</motion.p>
									))}
								</div>
							</motion.div>

							{/* CTA for last step */}
							{isLast && (
								<motion.div 
									className="text-center pt-8"
									initial={{ opacity: 0, y: 30 }}
									animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
									transition={{ duration: 0.6, delay: index * 0.2 + 1 }}
								>
									<motion.a 
										href="/contact" 
										className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#B8E62D] to-[#9ACD32] text-black font-semibold rounded-full hover:shadow-[0_0_40px_rgba(184,230,45,0.6)] transition-all duration-300 hover:scale-105 relative overflow-hidden group"
										whileHover={{ y: -2 }}
										whileTap={{ scale: 0.98 }}
									>
										<span className="relative z-10">Let's Create Something Amazing</span>
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-[#9ACD32] to-[#B8E62D] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										/>
										<svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</motion.a>
								</motion.div>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Timeline connector */}
			<TimelineConnector isLast={isLast} progress={scrollYProgress} />
		</motion.div>
	);
};

// --- MAIN COMPONENT ---

const MyStory: React.FC = () => {
	return (
		<section className="relative w-full font-sans text-white py-20 md:py-32 overflow-hidden">
			{/* <Starfield /> */}
			
			{/* Smooth gradient transition from background image to black */}
			<div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-black/50 to-black" />
			<div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black" />
			
			{/* Section title with enhanced styling */}
			<div className="container mx-auto px-4 mb-20 relative z-10">
				<motion.div 
					className="text-center"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					viewport={{ once: true }}
				>
					<motion.div
						className="inline-block mb-8"
						initial={{ scale: 0.8, opacity: 0 }}
						whileInView={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<div className="px-4 py-2 rounded-full border border-[#B8E62D]/30 bg-[#B8E62D]/10 backdrop-blur-sm text-sm text-[#B8E62D] font-medium">
							✨ Journey Through Time
						</div>
					</motion.div>
					
					<motion.h1 
						className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
					>
						My <span className="bg-gradient-to-r from-[#B8E62D] to-[#9ACD32] bg-clip-text text-transparent">Story</span>
					</motion.h1>
					
					<motion.p 
						className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
					>
						The journey that shaped who I am today
					</motion.p>
					
					{/* Animated underline */}
					<motion.div
						className="w-24 h-1 bg-gradient-to-r from-[#B8E62D] to-[#9ACD32] mx-auto mt-8 rounded-full"
						initial={{ width: 0, opacity: 0 }}
						whileInView={{ width: 96, opacity: 1 }}
						transition={{ duration: 1, delay: 0.8 }}
					/>
				</motion.div>
			</div>

			{/* Subtle floating elements */}
			<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
				<motion.div 
					className="absolute top-20 left-10 w-2 h-2 bg-[#B8E62D]/60 rounded-full blur-[1px]"
					animate={{ 
						y: [-15, 15, -15],
						opacity: [0.3, 0.6, 0.3]
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
				/>
				<motion.div 
					className="absolute top-1/3 right-20 w-3 h-3 bg-white/40 rounded-full blur-[1px]"
					animate={{ 
						y: [15, -15, 15],
						opacity: [0.2, 0.5, 0.2]
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
				/>
			</div>

			{/* Story steps with enhanced container */}
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-4xl mx-auto">
					{storyData.filter(chapter => chapter.id !== 'manifesto').map((chapter, index, filteredArray) => (
						<StoryStep 
							key={chapter.id} 
							chapter={chapter} 
							index={index} 
							isLast={index === filteredArray.length - 1} 
						/>
					))}
				</div>
			</div>

			{/* Manifesto Section */}
			{(() => {
				const manifesto = storyData.find(chapter => chapter.id === 'manifesto');
				return manifesto ? <ManifestoSection manifesto={manifesto} /> : null;
			})()}

			{/* Final Chapter */}
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-4xl mx-auto">
					{(() => {
						const finalChapter = storyData.find(chapter => chapter.id === 'next-chapter');
						if (finalChapter) {
							const finalIndex = storyData.indexOf(finalChapter);
							return (
								<StoryStep 
									key={finalChapter.id} 
									chapter={finalChapter} 
									index={finalIndex} 
									isLast={true} 
								/>
							);
						}
						return null;
					})()}
				</div>
			</div>

			{/* Beyond Work Section moved here to keep single scroll context */}
			<BeyondWorkSection />
		</section>
	);
};

export default MyStory;