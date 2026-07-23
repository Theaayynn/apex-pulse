import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const uploadAvatarSchema = z.object({
  // data URL, e.g. "data:image/png;base64,...."
  image: z.string().startsWith("data:image/", "Must be an image data URL"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion"),
  confirm: z.literal(true, { errorMap: () => ({ message: "You must confirm account deletion" }) }),
});

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4, "Subject is too short").max(150),
  description: z.string().trim().min(10, "Please describe the issue in more detail").max(3000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

export const ticketMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(3000),
});
