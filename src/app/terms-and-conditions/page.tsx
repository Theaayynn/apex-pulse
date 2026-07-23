import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h1 className="mb-2 text-4xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
          <p className="mb-10 text-sm text-foreground/40">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="space-y-6 text-foreground/70">
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">1. Acceptance of terms</h2>
              <p>
                By creating an account or using Apex Pulse, you agree to these terms. If you don&apos;t
                agree, please don&apos;t use the service.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">2. Accounts</h2>
              <p>
                You&apos;re responsible for maintaining the confidentiality of your login credentials
                and for all activity under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">3. Acceptable use</h2>
              <p>
                Don&apos;t use the platform to violate any law, infringe on others&apos; rights, distribute
                malware, or attempt to bypass rate limiting, authentication, or access controls.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">4. Payment &amp; billing</h2>
              <p>
                Paid plans are billed in advance on a monthly or yearly basis through Stripe or
                Razorpay. See our <a href="/refund-policy" className="text-accent-soft hover:underline">Refund Policy</a>{" "}
                for cancellation and refund terms.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">5. Termination</h2>
              <p>
                We may suspend or terminate accounts that violate these terms. You may delete your
                account at any time from Settings.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">6. Limitation of liability</h2>
              <p>
                The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent
                permitted by law, Apex Pulse isn&apos;t liable for indirect or consequential damages
                arising from use of the platform.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">7. Changes to these terms</h2>
              <p>We may update these terms from time to time. Continued use after changes constitutes acceptance.</p>
            </section>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
