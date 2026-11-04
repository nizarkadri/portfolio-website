"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-28 text-center">
      <h1 className="text-4xl font-bold text-white">Something went wrong</h1>
      <p className="mt-3 text-soft-white/65">{error.message || 'Could not load blog posts.'}</p>
      <button onClick={reset} className="mt-8 rounded-full bg-[#B8E62D] px-6 py-3 font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Try again</button>
    </div>
  );
}
