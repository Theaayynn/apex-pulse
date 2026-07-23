import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, status, user } = await requireAdminApi();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.galleryItem.delete({ where: { id } }).catch(() => null);
  await prisma.auditLog.create({ data: { userId: user.id, action: "GALLERY_ITEM_DELETED", entityType: "GalleryItem", entityId: id } });

  return NextResponse.json({ message: "Gallery item deleted." });
}
