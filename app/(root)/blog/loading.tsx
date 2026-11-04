export default function Loading() {
  return (
    <div className="min-h-screen py-24" aria-busy="true">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="h-16 w-64 animate-pulse rounded-2xl bg-white/5" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />)}
        </div>
      </div>
    </div>
  );
}
