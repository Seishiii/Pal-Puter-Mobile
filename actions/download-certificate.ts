"use server";

import db from "@/db/drizzle";
import { certificates } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const downloadCertificate = async (certificateId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
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
    throw new Error("Certificate not found");
  }

  if (certificate.courseProgress.userId !== userId) {
    throw new Error("Forbidden");
  }

  // Convert to Uint8Array
  const uint8Array = new Uint8Array(certificate.fileData);

  return {
    fileName: certificate.fileName,
    mimeType: certificate.mimeType,
    fileData: uint8Array,
  };
};
