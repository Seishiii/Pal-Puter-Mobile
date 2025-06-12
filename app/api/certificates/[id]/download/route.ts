// app/api/certificates/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { certificates } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const certificateId = parseInt((await params).id);
    if (isNaN(certificateId)) {
      return new NextResponse("Invalid certificate ID", { status: 400 });
    }

    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, certificateId),
      with: {
        courseProgress: {
          columns: { userId: true },
        },
      },
    });

    if (!certificate) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    if (certificate.courseProgress.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create new ArrayBuffer and copy data
    const arrayBuffer = new ArrayBuffer(certificate.fileData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    uint8Array.set(certificate.fileData);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": certificate.mimeType,
        "Content-Disposition": `attachment; filename="${certificate.fileName}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
