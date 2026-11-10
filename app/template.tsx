// Route transition: opacity only. A transform on this wrapper would break
// every sticky and fixed stage beneath it.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="lg-fade">{children}</div>;
}
