import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  // Honeypot field — real users never fill this in; bots often do.
  company: z.string().max(0, "Spam detected").optional(),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const careerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  position: z.string().trim().min(2).max(100),
  resumeUrl: z.string().trim().url("Provide a valid resume URL"),
  coverLetter: z.string().trim().max(3000).optional(),
});

export const callbackSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  preferredTime: z.string().trim().max(100).optional(),
});

export const feedbackSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  message: z.string().trim().min(5).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(5).max(2000),
});

export const complaintSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  message: z.string().trim().min(10, "Please describe the issue in more detail").max(2000),
});
