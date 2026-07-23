import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import MagneticButton from "@/components/MagneticButton";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-md text-center">
        <Reveal>
          <GlassCard className="px-8 py-12">
            <XCircle className="mx-auto mb-4 text-red-400" size={40} />
            <h1 className="mb-2 text-xl font-semibold">Payment not completed</h1>
            <p className="mb-6 text-sm text-foreground/55">
              No charge was made. You can try again anytime from the pricing page.
            </p>
            <MagneticButton href="/pricing">Back to pricing</MagneticButton>
          </GlassCard>
        </Reveal>
      </div>
    </main>
  );
}
