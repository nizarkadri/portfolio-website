import Link from "next/link";
import { motion } from "framer-motion";
import {useIsMobile} from "../app/hooks/useMobile";
const Experience = () => {
  const isMobile = useIsMobile();
  console.log(isMobile);
    return (
        <section className="relative pt-24 pb-26 md:pb-36">
          <motion.h2 
            className="huge-text absolute top-6 md:-top-16 left-[7%] md:left-[20%] md:translate-x-0 opacity-80 text-[#B8E62D]/90 font-bold select-none"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 0.8, x: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            EXPERIENCE
          </motion.h2>
          
          <div className="flex items-center mb-10">
            <motion.div 
              className="h-px bg-[#B8E62D]/20 w-full ml-[8%] md:ml-0"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ 
                opacity: 1, 
                width: isMobile ? "85%" : "100%",
                transition: {
                  duration: 0.8,
                  delay: 0.2
                }
              }}
              viewport={{ once: false, margin: "-100px" }}
            />
          </div>
          
          {/* Experience Preview */}
          <div className="relative mb-20 mx-5 md:mx-0 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Experience Details - Left Side */}
              <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-8 rounded-2xl backdrop-blur-sm border border-white/5 hover:border-[#B8E62D]/20 transition-all duration-500 shadow-lg shadow-black/40">
                <h3 className="text-2xl font-bold text-white mb-1">Software Engineer</h3>
                <p className="text-xl text-white/80 font-medium">CGI</p>
                <p className="text-[#B8E62D] text-sm mb-2">Jun 2022 - Dec 2024</p>
                <p className="text-soft-white/60 text-sm mb-4">Toronto, Canada</p>
                
                <p className="text-soft-white mb-6 leading-relaxed">Led development of high-performance applications and optimized existing systems.</p>
                
                <div className="mb-6">
                  <h4 className="text-white flex items-center gap-2 mb-3">
                    <span className="text-[#B8E62D]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Key Achievements
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-[#B8E62D] mt-1 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-white/80 text-sm">Reduced deployment time by 40% and enhanced scalability by migrating to microservices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#B8E62D] mt-1 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-white/80 text-sm">Improved website performance by 70% and achieved 98% WCAG 2.1 accessibility</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-transparent backdrop-blur-sm px-3 py-1 rounded-full border border-[#B8E62D]/50 text-white">React</span>
                  <span className="text-xs bg-transparent backdrop-blur-sm px-3 py-1 rounded-full border border-[#B8E62D]/50 text-white">Java</span>
                  <span className="text-xs bg-transparent backdrop-blur-sm px-3 py-1 rounded-full border border-[#B8E62D]/50 text-white">Spring Boot</span>
                </div>
              </div>
              
              {/* Performance Metrics - Right Side */}
              <div className="bg-deep-black/80 backdrop-blur-lg p-6 rounded-xl border border-white/5 hover:border-[#B8E62D]/20 transition-all duration-500 shadow-lg shadow-black/40">
                <h3 className="text-white text-xl font-medium mb-6">Performance Metrics</h3>
                
                {/* Donut chart */}
                <div className="mb-10 relative">
                  <div className="flex items-center justify-center mb-5">
                    <div className="relative w-48 h-48">
                      {/* Donut chart background */}
                      <div className="absolute inset-0 rounded-full bg-gray-700/30 border border-white/5"></div>
                      
                      {/* Progress segment with gradient */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(#B8E62D 0%, #a3cc29 40%, transparent 40% 100%)`,
                          clipPath: 'circle(50% at center)'
                        }}
                      ></div>
                      
                      {/* Inner circle for donut hole */}
                      <div className="absolute inset-0 rounded-full bg-deep-black/90 m-10 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-white">40%</span>
                        <span className="text-[#B8E62D] text-sm mt-1">Faster Deployment</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-white/70 text-sm">Reduced deployment time by 40%...</p>
                    <p className="text-[#B8E62D] font-medium">Java Spring Boot</p>
                  </div>
                </div>

                {/* Performance Bars */}
                <div className="space-y-6">
                  <div className="relative">
                    <div className="mb-2 flex justify-between items-center px-1">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#B8E62D] to-[#a3cc29] text-black">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white font-medium text-sm">Performance Boost</span>
                      </div>
                      <span className="text-white font-bold">70%</span>
                    </div>
                    
                    <div className="h-12 relative rounded-lg overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-700/20"></div>
                      
                      {/* Progress bar with gradient */}
                      <div 
                        className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-[#B8E62D] to-[#a3cc29]"
                        style={{ width: `70%` }}
                      ></div>
                      
                      {/* Project/Tech name overlay */}
                      <div className="absolute inset-0 flex items-center px-4 justify-between">
                        <span className="text-black text-sm font-medium drop-shadow-sm z-10">
                          SEDAR Plus Portal
                        </span>
                        
                        {/* Secondary metric */}
                        <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center z-10">
                          <span className="text-white/80 mr-1">Secondary Metric:</span>
                          <span className="text-[#B8E62D] font-medium">98%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fade Overlay */}
            <div className="absolute left-0 right-0 bottom-0 h-80 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
          
          {/* View All Button below content */}
          <div className="flex justify-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(184, 230, 45, 0.15)",
                borderColor: "#B8E62D",
                boxShadow: "0 0 20px rgba(184, 230, 45, 0.3)",
                transition: { duration: 0.3 }
              }}
            >
              <Link 
                href="/experience" 
                className="px-8 py-3 border border-[#B8E62D]/50 text-[#B8E62D] rounded-md inline-flex items-center group transition-all duration-300 font-medium backdrop-blur-sm bg-black/40"
              >
                View All Experiences
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
    )
}

export default Experience;