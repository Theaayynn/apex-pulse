import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadAvatarSchema } from "@/lib/validations/user";
import { uploadToCloudinary, cloudinaryConfigured } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const payload = await getCurrentUser();
  if (!payload) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const limit = rateLimit(`avatar:${payload.sub}`, { windowMs: 60 * 60 * 1000, max: 20 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  if (!cloudinaryConfigured) {
    return NextResponse.json(
      { error: "Avatar uploads are not configured yet. Set the CLOUDINARY_* environment variables." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = uploadAvatarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const { url } = await uploadToCloudinary(parsed.data.image, `apex-pulse/avatars/${payload.sub}`);

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: { avatarUrl: url },
      select: { avatarUrl: true },
    });

    await prisma.auditLog.create({
      data: { userId: payload.sub, action: "AVATAR_UPDATED", entityType: "User", entityId: payload.sub },
    });

    return NextResponse.json({ message: "Avatar updated.", avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("[avatar] Upload failed:", err);
    return NextResponse.json({ error: "Avatar upload failed. Please try again." }, { status: 502 });
  }
}
