import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/pricing",
    "/blog",
    "/faq",
    "/careers",
    "/contact",
    "/testimonials",
    "/gallery",
    "/case-studies",
    "/privacy-policy",
    "/refund-policy",
    "/terms-and-conditions",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const [posts, studies] = await Promise.all([
    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.caseStudy.findMany({ where: { isPublished: true }, select: { slug: true, createdAt: true } }),
  ]);

  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const caseStudyRoutes = studies.map((s) => ({
    url: `${base}/case-studies/${s.slug}`,
    lastModified: s.createdAt,
  }));

  return [...staticRoutes, ...blogRoutes, ...caseStudyRoutes];
}
