import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123", 12);

  const users = [
    { name: "Super Admin", email: "superadmin@apexpulse.com", role: "SUPER_ADMIN" as const },
    { name: "Admin User", email: "admin@apexpulse.com", role: "ADMIN" as const },
    { name: "Employee User", email: "employee@apexpulse.com", role: "EMPLOYEE" as const },
    { name: "Customer User", email: "customer@apexpulse.com", role: "CUSTOMER" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        role: u.role,
        passwordHash: password,
        isEmailVerified: true,
        isActive: true,
      },
    });
  }

  // Seed a couple of pricing plans so Phase 4/5 billing has something to work with.
  await prisma.plan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "For individuals getting started.",
      priceMonthly: 99900, // ₹999.00
      priceYearly: 999900,
      currency: "INR",
      features: ["1 project", "Basic analytics", "Email support"],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "For growing teams.",
      priceMonthly: 299900,
      priceYearly: 2999900,
      currency: "INR",
      features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domain"],
    },
  });

  console.log("✅ Seed complete.");
  console.log("   Login with any of these (password: Password123):");
  users.forEach((u) => console.log(`   - ${u.email} (${u.role})`));

  // -------------------------------------------------------------------------
  // Phase 2 — marketing content (blog, testimonials, gallery, case studies, FAQs)
  // -------------------------------------------------------------------------

  await prisma.blogPost.upsert({
    where: { slug: "why-we-built-apex-pulse" },
    update: {},
    create: {
      title: "Why we built Apex Pulse",
      slug: "why-we-built-apex-pulse",
      excerpt: "Every serious product needs the same unglamorous scaffolding. We got tired of building it from scratch every time.",
      content:
        "Every serious product needs the same unglamorous scaffolding: accounts, roles, billing, an admin panel, a way to edit content without a deploy.\n\nWe kept rebuilding this foundation project after project — the same auth flow, the same admin CRUD screens, the same rate limiting logic. Apex Pulse is that foundation, built once and built properly, so teams can spend their time on what actually makes their product different.\n\nThis blog will track the build in the open: architecture decisions, trade-offs, and the occasional thing we got wrong the first time.",
      authorName: "Apex Pulse Team",
      tags: ["engineering", "product"],
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "designing-the-auth-system" },
    update: {},
    create: {
      title: "Designing the auth system: JWT, RBAC, and audit logs",
      slug: "designing-the-auth-system",
      excerpt: "A walkthrough of the access/refresh token model, role-based middleware, and why every sensitive action gets logged.",
      content:
        "Access tokens live 15 minutes in an httpOnly cookie; refresh tokens live 30 days in a separate httpOnly cookie tied to a Session row in Postgres, so any session can be revoked server-side — not just by waiting for a JWT to expire.\n\nRoles (Super Admin, Admin, Employee, Customer) are checked in two places: Next.js middleware for route-level redirects, and inside each API route for data-level authorization. Neither one trusts the other.\n\nEvery sensitive action — login, password reset, role change — writes an AuditLog row. It's saved us more than once when debugging 'who changed this' questions.",
      authorName: "Apex Pulse Team",
      tags: ["security", "architecture"],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const testimonialsData = [
    { authorName: "Priya Nair", authorRole: "CTO, Loopline", content: "We replaced three separate tools with the admin panel alone. Support tickets, leads, and content editing in one place.", rating: 5, isFeatured: true },
    { authorName: "Marcus Webb", authorRole: "Founder, Driftwood", content: "The auth system alone saved us two weeks of engineering time. RBAC just worked out of the box.", rating: 5, isFeatured: true },
    { authorName: "Sana Iqbal", authorRole: "Head of Product, Fernwell", content: "Fastest onboarding of any platform we've evaluated. Seed data meant we were testing real flows on day one.", rating: 5, isFeatured: true },
  ];
  for (const t of testimonialsData) {
    const existing = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!existing) await prisma.testimonial.create({ data: t });
  }

  const faqsData = [
    { question: "What's included in every plan?", answer: "Every plan includes the full platform — authentication, the admin panel, and CMS. Higher tiers add scale (more projects, priority support) rather than gating core features.", category: "Billing", order: 1 },
    { question: "Can I cancel anytime?", answer: "Yes. Monthly plans cancel immediately with access continuing until the end of the billing period. See our Refund Policy for yearly plan terms.", category: "Billing", order: 2 },
    { question: "Is my data encrypted?", answer: "Passwords are hashed with bcrypt and never stored in plain text. Session tokens live in httpOnly cookies, and all traffic is served over HTTPS in production.", category: "Security", order: 1 },
    { question: "Can I export my data?", answer: "Yes — contact support and we'll provide a full export of your account data.", category: "Security", order: 2 },
    { question: "Do you offer custom development?", answer: "Yes, see our Services page or reach out via Contact to discuss a custom build.", category: "General", order: 1 },
  ];
  for (const f of faqsData) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question } });
    if (!existing) await prisma.fAQ.create({ data: f });
  }

  await prisma.caseStudy.upsert({
    where: { slug: "loopline-support-consolidation" },
    update: {},
    create: {
      title: "How Loopline consolidated 3 tools into one admin panel",
      slug: "loopline-support-consolidation",
      client: "Loopline",
      summary: "Loopline replaced their separate support desk, lead tracker, and CMS with Apex Pulse's unified admin panel.",
      content:
        "Loopline was running Zendesk for support, a spreadsheet for lead tracking, and a headless CMS for their marketing site — three logins, three data silos, and no single view of a customer's journey.\n\nAfter migrating to Apex Pulse, all three functions live in one admin panel backed by one Postgres database. Support tickets link directly to the customer's order history; leads convert into accounts without manual re-entry; and marketing can edit blog posts and testimonials without filing an engineering ticket.\n\nThe team estimates they save roughly six hours a week previously spent reconciling data between tools.",
      metrics: { "Tools replaced": "3 → 1", "Time saved / week": "~6 hrs", "Migration time": "9 days" },
      isPublished: true,
    },
  });

  const galleryData = [
    { title: "Admin dashboard — analytics view", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", category: "Admin" },
    { title: "Dark mode dashboard", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", category: "Dashboard" },
    { title: "Mobile responsive views", imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800", category: "Mobile" },
  ];
  for (const g of galleryData) {
    const existing = await prisma.galleryItem.findFirst({ where: { title: g.title } });
    if (!existing) await prisma.galleryItem.create({ data: g });
  }

  console.log("   Phase 2 CMS content seeded: blog posts, testimonials, FAQs, case study, gallery.");

  // -------------------------------------------------------------------------
  // Phase 3 — sample dashboard data for the demo customer account
  // -------------------------------------------------------------------------

  const customer = await prisma.user.findUnique({ where: { email: "customer@apexpulse.com" } });
  const proPlan = await prisma.plan.findUnique({ where: { slug: "pro" } });

  if (customer && proPlan) {
    const existingOrder = await prisma.order.findFirst({ where: { userId: customer.id } });

    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          planId: proPlan.id,
          amount: proPlan.priceMonthly,
          currency: proPlan.currency,
          status: "PAID",
          gateway: "STRIPE",
          gatewayOrderId: "seed_order_demo_001",
        },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          gateway: "STRIPE",
          gatewayPaymentId: "seed_payment_demo_001",
          amount: order.amount,
          currency: order.currency,
          status: "succeeded",
        },
      });

      await prisma.invoice.create({
        data: {
          orderId: order.id,
          userId: customer.id,
          invoiceNumber: "INV-2026-0001",
          status: "PAID",
          amount: order.amount,
          currency: order.currency,
        },
      });

      await prisma.notification.createMany({
        data: [
          { userId: customer.id, title: "Payment received", body: "Your payment for the Pro plan was successful.", channel: "EMAIL" },
          { userId: customer.id, title: "Welcome to Apex Pulse", body: "Your account is fully set up — explore the dashboard.", channel: "IN_APP", isRead: true },
        ],
      });

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: customer.id,
          subject: "Question about invoice PDF downloads",
          description: "Is there a way to download invoices as PDF directly from the dashboard?",
          status: "OPEN",
          priority: "LOW",
        },
      });

      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: customer.id,
          message: "Is there a way to download invoices as PDF directly from the dashboard?",
        },
      });
    }
  }

  console.log("   Phase 3 sample dashboard data seeded for customer@apexpulse.com.");

  // -------------------------------------------------------------------------
  // Phase 4 — sample data for the admin panel (leads, careers, assigned ticket)
  // -------------------------------------------------------------------------

  const existingLeads = await prisma.lead.count();
  if (existingLeads === 0) {
    await prisma.lead.createMany({
      data: [
        { formType: "contact", name: "Arjun Mehta", email: "arjun@example.com", message: "Interested in a custom enterprise plan for our 40-person team.", status: "NEW" },
        { formType: "callback", name: "Emma Clarke", email: "emma@example.com", phone: "+44 7700 900123", message: "Requested a callback", status: "CONTACTED" },
        { formType: "complaint", name: "Ravi Shah", email: "ravi@example.com", message: "Invoice amount looks incorrect for last month's billing cycle.", status: "QUALIFIED" },
      ],
    });
  }

  const existingCareerApps = await prisma.careerApplication.count();
  if (existingCareerApps === 0) {
    await prisma.careerApplication.create({
      data: {
        fullName: "Diya Kapoor",
        email: "diya.kapoor@example.com",
        phone: "+91 98765 12340",
        position: "Senior Full-Stack Engineer",
        resumeUrl: "https://example.com/resumes/diya-kapoor.pdf",
        coverLetter: "5 years of experience building Next.js + Postgres applications at scale.",
      },
    });
  }

  const employee = await prisma.user.findUnique({ where: { email: "employee@apexpulse.com" } });
  if (customer && employee) {
    const secondTicketExists = await prisma.supportTicket.findFirst({
      where: { userId: customer.id, subject: { contains: "billing cycle" } },
    });
    if (!secondTicketExists) {
      const assignedTicket = await prisma.supportTicket.create({
        data: {
          userId: customer.id,
          assigneeId: employee.id,
          subject: "Clarify billing cycle start date",
          description: "Could you confirm whether my billing cycle resets on the 1st or on my signup date?",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
        },
      });
      await prisma.ticketMessage.createMany({
        data: [
          { ticketId: assignedTicket.id, senderId: customer.id, message: "Could you confirm whether my billing cycle resets on the 1st or on my signup date?" },
          { ticketId: assignedTicket.id, senderId: employee.id, message: "Great question — it resets on your original signup date each month, not the calendar month." },
        ],
      });
    }
  }

  console.log("   Phase 4 sample admin-panel data seeded: leads, career application, assigned ticket.");

  // -------------------------------------------------------------------------
  // Phase 5 — sample coupon for testing the checkout flow
  // -------------------------------------------------------------------------

  await prisma.coupon.upsert({
    where: { code: "LAUNCH20" },
    update: {},
    create: {
      code: "LAUNCH20",
      discountType: "PERCENT",
      discountValue: 20,
      maxRedemptions: 100,
      isActive: true,
    },
  });

  console.log("   Phase 5 sample coupon seeded: LAUNCH20 (20% off).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
