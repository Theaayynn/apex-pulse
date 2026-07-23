import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const smtpTransport =
  process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    : null;

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends via Resend if configured, else falls back to SMTP via Nodemailer.
 * In development with neither configured, logs to console so the flow is
 * still testable end-to-end without real credentials.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<void> {
  const from = process.env.EMAIL_FROM || "Apex Pulse <no-reply@apexpulse.com>";

  if (resend) {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return;
  }

  if (smtpTransport) {
    await smtpTransport.sendMail({ from, to, subject, html });
    return;
  }

  console.warn(
    `[email] No RESEND_API_KEY or SMTP configured — logging email instead of sending.\nTo: ${to}\nSubject: ${subject}\n${html}`
  );
}

/**
 * Shared branded wrapper — every transactional email uses this so the product
 * has one consistent visual identity in the inbox, not a pile of unstyled snippets.
 */
function emailLayout(preheader: string, bodyHtml: string): string {
  return `
  <div style="background:#05050A; padding:32px 16px; font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background:#0A0A12; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px; color:#F5F5F7;">
      <p style="margin:0 0 24px; font-size:14px; font-weight:600; letter-spacing:-0.01em;">
        Apex<span style="color:#A78BFA;">Pulse</span>
      </p>
      ${bodyHtml}
      <p style="margin-top:32px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); color:rgba(245,245,247,0.35); font-size:12px;">
        ${preheader}
      </p>
    </div>
  </div>`;
}

function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#7C5CFF;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">${label}</a>`;
}

export function verifyEmailTemplate(name: string, verifyUrl: string): string {
  return emailLayout(
    "This link expires in 24 hours. If you didn't create an account, ignore this email.",
    `
      <h2 style="margin:0 0 12px; font-size:20px;">Welcome, ${name}</h2>
      <p style="margin:0 0 20px; color:rgba(245,245,247,0.7); font-size:14px; line-height:1.6;">
        Please verify your email address to activate your account.
      </p>
      ${emailButton(verifyUrl, "Verify email")}
    `
  );
}

export function resetPasswordTemplate(name: string, resetUrl: string): string {
  return emailLayout(
    "This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.",
    `
      <h2 style="margin:0 0 12px; font-size:20px;">Reset your password</h2>
      <p style="margin:0 0 20px; color:rgba(245,245,247,0.7); font-size:14px; line-height:1.6;">
        Hi ${name}, we received a request to reset your password.
      </p>
      ${emailButton(resetUrl, "Reset password")}
    `
  );
}

export function orderConfirmationTemplate(name: string, planName: string, invoiceNumber: string, amountFormatted: string): string {
  return emailLayout(
    "You can view this invoice anytime from your dashboard.",
    `
      <h2 style="margin:0 0 12px; font-size:20px;">Payment received</h2>
      <p style="margin:0 0 20px; color:rgba(245,245,247,0.7); font-size:14px; line-height:1.6;">
        Hi ${name}, thanks for your payment for the <strong style="color:#F5F5F7;">${planName}</strong> plan.
      </p>
      <table style="width:100%; font-size:14px; margin-bottom:20px;">
        <tr><td style="padding:4px 0; color:rgba(245,245,247,0.5);">Invoice</td><td style="padding:4px 0; text-align:right;">${invoiceNumber}</td></tr>
        <tr><td style="padding:4px 0; color:rgba(245,245,247,0.5);">Amount</td><td style="padding:4px 0; text-align:right;">${amountFormatted}</td></tr>
      </table>
    `
  );
}

export function ticketReplyTemplate(name: string, subject: string, message: string, ticketUrl: string): string {
  return emailLayout(
    "Reply from within your dashboard to keep the conversation going.",
    `
      <h2 style="margin:0 0 12px; font-size:20px;">New reply on your ticket</h2>
      <p style="margin:0 0 8px; color:rgba(245,245,247,0.5); font-size:13px;">${subject}</p>
      <p style="margin:0 0 20px; color:rgba(245,245,247,0.8); font-size:14px; line-height:1.6; background:rgba(255,255,255,0.04); border-radius:8px; padding:12px;">
        ${message}
      </p>
      ${emailButton(ticketUrl, "View conversation")}
    `
  );
}

export function adminFormNotificationTemplate(formType: string, fields: Record<string, string | undefined>): string {
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0; color:rgba(245,245,247,0.5); text-transform:capitalize; vertical-align:top;">${k}</td><td style="padding:6px 0;">${v}</td></tr>`
    )
    .join("");
  return emailLayout(
    "This notification was sent because ADMIN_EMAIL is configured to receive form submissions.",
    `
      <h2 style="margin:0 0 16px; font-size:18px;">New ${formType} submission</h2>
      <table style="width:100%; font-size:14px;">${rows}</table>
    `
  );
}
