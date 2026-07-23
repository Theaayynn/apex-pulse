import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Gallery", description: "A look at what we've shipped." };
export const revalidate = 120;

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Gallery
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Shipped work</h1>
          <p className="mt-6 text-foreground/60">Screens, moments, and details from real projects.</p>
        </Reveal>
      </div>

      {items.length === 0 ? (
        <p className="mt-16 text-center text-foreground/50">The gallery is being curated — check back soon.</p>
      ) : (
        <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 0.06}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
