import { z } from "zod";

export const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().max(300).optional(),
  priceMonthly: z.number().int().min(0),
  priceYearly: z.number().int().min(0),
  currency: z.string().trim().length(3).default("INR"),
  features: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(30).toUpperCase(),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.number().int().min(1),
  maxRedemptions: z.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  authorName: z.string().trim().min(2).max(100),
  tags: z.array(z.string().trim().min(1)).default([]),
  isPublished: z.boolean().default(false),
});

export const caseStudySchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  client: z.string().trim().min(2).max(100),
  summary: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2).max(100),
  authorRole: z.string().trim().max(100).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  content: z.string().trim().min(10).max(500),
  rating: z.number().int().min(1).max(5).default(5),
  isFeatured: z.boolean().default(false),
});

export const faqSchema = z.object({
  question: z.string().trim().min(4).max(300),
  answer: z.string().trim().min(4).max(2000),
  category: z.string().trim().max(60).optional(),
  order: z.number().int().default(0),
});

export const galleryItemSchema = z.object({
  title: z.string().trim().min(2).max(150),
  imageUrl: z.string().trim().url("Must be a valid URL"),
  category: z.string().trim().max(60).optional(),
});
