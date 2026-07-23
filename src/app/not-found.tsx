import Reveal from "@/components/Reveal";
import MagneticButton from "@/components/MagneticButton";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
      <Reveal>
        <p className="mb-4 text-8xl font-semibold tracking-tight text-accent/30">404</p>
        <h1 className="mb-3 text-2xl font-semibold">This page doesn&apos;t exist</h1>
        <p className="mb-8 max-w-sm text-foreground/55">
          The link may be broken, or the page may have moved. Let&apos;s get you back on track.
        </p>
        <div className="flex justify-center gap-4">
          <MagneticButton href="/">Back to home</MagneticButton>
          <MagneticButton href="/contact" variant="glass">
            Report a broken link
          </MagneticButton>
        </div>
      </Reveal>
    </main>
  );
}
