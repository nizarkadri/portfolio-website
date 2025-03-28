import Link from "next/link";
import { motion } from "framer-motion";

const SectionTitle = () => {
  // const titleVariants = {
  //   initial: { opacity: 0, y: 20 },
  //   animate: { 
  //     opacity: 1, 
  //     y: 0,
  //     transition: {
  //       duration: 0.8,
  //       ease: [0.22, 1, 0.36, 1]
  //     }
  //   }
  // };
  
  // const lineVariants = {
  //   initial: { width: 0 },
  //   animate: { 
  //     width: "100%",
  //     transition: {
  //       duration: 1.2,
  //       ease: [0.22, 1, 0.36, 1],
  //       delay: 0.3
  //     }
  //   }
  // };
  
  const buttonVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.5
      }
    },
    hover: { 
      backgroundColor: "rgba(184, 230, 45, 0.08)",  // Subtle lime tint (8%)
      color: "#D9FF4B",                             // Softer neon text
      borderColor: "#B8E62D",
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-16">
      <div className="flex items-center">
        <motion.div 
          className="h-px bg-[#B8E62D]/20 w-48 md:w-64"
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ 
            opacity: 1, 
            width: "100%",
            transition: {
              duration: 0.8,
              delay: 0.2
            }
          }}
          viewport={{ once: true, margin: "-100px" }}
        />
      </div>
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileInView="animate"
        whileHover="hover"
        viewport={{ once: true, margin: "-100px" }}
      >
        <Link 
          href="/experience" 
          className="px-5 py-2 border border-[#B8E62D]/50 text-[#B8E62D] rounded-md inline-flex items-center group transition-all duration-300"
        >
          View All
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
};

const Experience = () => {
    return (
        <section className="relative pt-24 pb-16">
          <motion.h2 
            className="huge-text absolute -top-16 left-0 opacity-80 text-[#B8E62D]/90 font-bold select-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            EXPERIENCE
          </motion.h2>
          
          <SectionTitle />
          
          {/* Display a preview of experience here */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5 hover:border-[#B8E62D]/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 30px -10px rgba(184, 230, 45, 0.1)",
                borderColor: "rgba(184, 230, 45, 0.3)"
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-white">Software Engineer</h3>
              <p className="text-lg mb-2 text-[#B8E62D]/90">CGI</p>
              <p className="text-sm mb-4 text-white/50">Jun 2022 - Dec 2024</p>
              <p className="text-sm text-white/70">Led development of high-performance applications and optimized existing systems.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5 hover:border-[#B8E62D]/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 30px -10px rgba(184, 230, 45, 0.1)",
                borderColor: "rgba(184, 230, 45, 0.3)"
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-white">Cloud Administrator</h3>
              <p className="text-lg mb-2 text-[#B8E62D]/90">Fiera Capital Corp.</p>
              <p className="text-sm mb-4 text-white/50">Sept 2021 - May 2022</p>
              <p className="text-sm text-white/70">Managed cloud infrastructure and optimized operations.</p>
            </motion.div>
          </motion.div>
        </section>
    )
}

export default Experience;