
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
    return (
        <section className="relative min-h-[100vh] flex items-center overflow-hidden">
          {/* Futuristic tech blurred background */}
          <div className="absolute inset-0 bg-deep-black z-0">
            <div className="absolute inset-0 opacity-20 bg-[url('/images/tech-background.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 backdrop-blur-[8px]"></div>
            <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#312e81]/10 to-transparent blur-[120px] animate-float-slow"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-[#5b21b6]/10 to-transparent blur-[100px] animate-float"></div>
          </div>
          
          {/* Futuristic grid lines */}
          <div className="absolute inset-0 z-0">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent top-1/4"></div>
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent top-2/4"></div>
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent top-3/4"></div>
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent left-1/4"></div>
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent left-2/4"></div>
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent left-3/4"></div>
          </div>

          {/* Floating 3D spheres */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="sphere sphere-lg absolute top-[15%] right-[10%]"></div>
            <div className="sphere sphere-sm absolute bottom-[25%] left-[15%]"></div>
            <div className="sphere sphere-md absolute top-[60%] right-[30%]"></div>
            <div className="sphere sphere-xs absolute top-[30%] left-[25%]"></div>
            <div className="sphere sphere-sm absolute bottom-[15%] right-[15%]"></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 z-10 relative">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                {/* Oversized staggered typography */}
                <div className="relative">
                  <h1 className="font-black leading-none">
                    <span className="block text-soft-white text-5xl md:text-6xl mb-2 opacity-80">NIZAR K</span>
                    <span className="block text-8xl md:text-[10rem] tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/20 pb-4">
                      SOFT<span className="text-white">WARE</span>
                    </span>
                    <div className="flex items-baseline gap-4">
                      <div className="w-16 h-[1px] bg-gradient-to-r from-white to-transparent"></div>
                      <span className="block text-2xl md:text-3xl text-soft-white/70 font-light tracking-wider uppercase">ENGINEER</span>
                    </div>
                  </h1>
                </div>
                
                <p className="text-xl text-soft-gray max-w-md slide-up font-light tracking-wide" style={{ animationDelay: '0.1s' }}>
                  Building high-quality digital experiences with a focus on innovation, minimalism, and user experience.
                </p>
                
                <div className="flex gap-6 slide-up" style={{ animationDelay: '0.2s' }}>
                  <Link href="/contact" className="group relative overflow-hidden px-8 py-3 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 border border-white/10 rounded-full">
                    <span className="relative z-10 flex items-center gap-2 text-sm uppercase tracking-wider font-medium">
                      <span>Get in touch</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </Link>
                  <Link href="/projects" className="group relative px-6 py-3 text-soft-white/80 hover:text-white transition-colors duration-300">
                    <span className="relative z-10 flex items-center gap-2 text-sm uppercase tracking-wider font-medium">
                      <span>View projects</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/30 group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </Link>
                </div>
              </div>
              
              {/* User photo with anime filter instead of 3D cube */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-deep-black/90 z-20 md:hidden"></div>
                <div className="w-64 h-64 md:w-[420px] md:h-[420px] relative group perspective">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#312e81]/30 to-[#5b21b6]/10 blur-[5px] animate-pulse-subtle"></div>
                  
                  {/* Profile image with anime filter */}
                  <div className="absolute inset-0 rounded-full overflow-hidden border border-white/10 shadow-2xl z-10 animate-float">
                    <Image 
                      src="/images/anime-profile.png" 
                      alt="Nizar K - Anime Style" 
                      width={500} 
                      height={500} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  {/* Decorative orb halos */}
                  <div className="absolute -inset-10 border border-white/5 rounded-full animate-spin-slow"></div>
                  <div className="absolute -inset-20 border border-white/3 rounded-full animate-reverse-spin-slow"></div>
                  
                  {/* Floating elements around the image */}
                  <div className="absolute top-1/4 -right-8 w-16 h-16 rounded-full border border-white/10 animate-float-slow z-30"></div>
                  <div className="absolute bottom-1/4 -left-12 w-20 h-20 rounded-full bg-gradient-to-br from-[#4f46e5]/10 to-transparent backdrop-blur-sm animate-float z-30"></div>
                  <div className="absolute top-0 left-1/2 w-1 h-24 bg-gradient-to-b from-white/5 to-transparent animate-pulse-subtle z-30"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/50 animate-bounce-slow">
            <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </section>
    )
}

export default Hero;