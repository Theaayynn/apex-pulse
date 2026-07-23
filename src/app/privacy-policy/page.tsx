import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h1 className="mb-2 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mb-10 text-sm text-foreground/40">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="prose-sm space-y-6 text-foreground/70">
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">1. Information we collect</h2>
              <p>
                We collect information you provide directly — name, email, phone number, and any
                content you submit through forms, your account profile, or support tickets. We also
                collect technical information automatically: IP address, browser type, and pages
                visited, used for security (rate limiting, audit logs) and basic analytics.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">2. How we use it</h2>
              <p>
                To operate your account, process payments, respond to support requests, send
                service emails (verification, password resets, receipts), and improve the product.
                We do not sell personal information to third parties.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">3. Data storage &amp; security</h2>
              <p>
                Passwords are hashed with bcrypt and never stored in plain text. Session tokens are
                stored in httpOnly cookies. Data is held in a PostgreSQL database with access
                restricted by role-based permissions and logged via our audit trail.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">4. Third-party services</h2>
              <p>
                We use Resend/SMTP for transactional email, Cloudinary for media storage, and
                Stripe/Razorpay for payment processing. Each processes only the data necessary to
                perform its function and maintains its own privacy practices.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">5. Your rights</h2>
              <p>
                You can update your profile, change your password, or delete your account at any
                time from Settings. Contact us to request a full export or deletion of your data.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-medium text-foreground">6. Contact</h2>
              <p>Questions about this policy: <a href="/contact" className="text-accent-soft hover:underline">contact us</a>.</p>
            </section>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
