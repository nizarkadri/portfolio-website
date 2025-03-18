import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-4xl w-full px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-10 text-white">Contact</h1>
        <div className="bg-gradient-to-b from-soft-black/40 to-soft-black/10 p-12 rounded-2xl backdrop-blur-sm border border-white/5">
          <p className="text-xl text-soft-white mb-8">
            Feel free to reach out for collaborations, job opportunities, or just to say hello!
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-soft-gray">Email</p>
                <a href="mailto:contact@example.com" className="text-white hover:text-white/80 transition-colors">
                  contact@example.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <p className="text-soft-gray">Social Media</p>
                <div className="flex space-x-4 mt-1">
                  <a href="#" className="text-white hover:text-white/80 transition-colors">
                    LinkedIn
                  </a>
                  <a href="#" className="text-white hover:text-white/80 transition-colors">
                    Twitter
                  </a>
                  <a href="#" className="text-white hover:text-white/80 transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
