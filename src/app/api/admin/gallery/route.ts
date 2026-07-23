import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { galleryItemSchema } from "@/lib/validations/cms";

export async function GET() {
  const { error, status } = await requireAdminApi();
  if (error) return NextResponse.json({ error }, { status });

  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => null);
  const parsed = galleryItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { category, ...rest } = parsed.data;
  const item = await prisma.galleryItem.create({ data: { ...rest, category: category || undefined } });

  await prisma.auditLog.create({ data: { userId: user.id, action: "GALLERY_ITEM_CREATED", entityType: "GalleryItem", entityId: item.id } });

  return NextResponse.json({ message: "Gallery item created.", item }, { status: 201 });
}
