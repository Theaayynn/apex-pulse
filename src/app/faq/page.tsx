import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";
import FAQAccordion from "./faq-accordion";

export const metadata: Metadata = { title: "FAQ", description: "Answers to common questions about Apex Pulse." };
export const revalidate = 120;

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            FAQ
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered</h1>
        </Reveal>
      </div>

      {faqs.length === 0 ? (
        <p className="mt-16 text-center text-foreground/50">
          No FAQs published yet — reach out via{" "}
          <a href="/contact" className="text-accent-soft hover:underline">contact</a> and we'll help directly.
        </p>
      ) : (
        <div className="mx-auto mt-16 max-w-2xl">
          <FAQAccordion faqs={faqs} />
        </div>
      )}
    </main>
  );
}
