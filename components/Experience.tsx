import Link from "next/link";

const Experience = () => {
    return (
        <section className="relative pt-24 pb-16">
          <h2 className="huge-text absolute -top-16 left-0">EXPERIENCE</h2>
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center">
              <h2 className="text-4xl font-bold tracking-tight">My Journey</h2>
              <div className="h-px bg-soft-black flex-grow ml-6 w-32"></div>
            </div>
            <Link href="/experience" className="text-soft-white hover:text-white font-medium flex items-center">
              <span>View all</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-16 text-center rounded-2xl backdrop-blur-sm border border-white/5">
            <div className="icon-3d mx-auto w-20 h-20 flex items-center justify-center mb-8 glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-6 text-white">Professional Experience</h3>
            <p className="text-soft-gray mb-8 max-w-md mx-auto">My work history and professional experience will be available soon.</p>
            <Link href="/experience" className="btn btn-primary rounded-full">
              View Experience Page
            </Link>
          </div>
        </section>
    )
}

export default Experience;