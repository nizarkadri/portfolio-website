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
            <Link href="/experience" className="px-5 py-2 border border-soft-black hover:bg-soft-black hover:text-white transition-colors">
              View All
            </Link>
          </div>
          
          {/* Display a preview of experience here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5">
              <h3 className="text-xl font-bold mb-2">Software Engineer</h3>
              <p className="text-lg mb-2">CGI</p>
              <p className="text-sm mb-4">Jun 2022 - Dec 2024</p>
              <p className="text-sm">Led development of high-performance applications and optimized existing systems.</p>
            </div>
            
            <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-6 rounded-xl backdrop-blur-sm border border-white/5">
              <h3 className="text-xl font-bold mb-2">Cloud Administrator</h3>
              <p className="text-lg mb-2">Fiera Capital Corp.</p>
              <p className="text-sm mb-4">Sept 2021 - May 2022</p>
              <p className="text-sm">Managed cloud infrastructure and optimized operations.</p>
            </div>
          </div>
        </section>
    )
}

export default Experience;