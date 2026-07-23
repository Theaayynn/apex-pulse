export default function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 animate-aurora rounded-full bg-accent/30 blur-[120px]" />
      <div
        className="absolute right-[-10%] top-[20%] h-[50vh] w-[50vh] animate-aurora rounded-full bg-accent-glow/20 blur-[120px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute left-[-10%] bottom-[-10%] h-[55vh] w-[55vh] animate-aurora rounded-full bg-accent-soft/20 blur-[130px]"
        style={{ animationDelay: "-12s" }}
      />
      {/* Fine noise texture keeps the gradients from banding and adds material grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
