"use server";

import db from "@/db/drizzle";
import { certificates } from "@/db/schema";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

export const verifyCertificateByHash = async (hash: string) => {
  const certificate = await db.query.certificates.findFirst({
    where: eq(certificates.hash, hash),
    with: {
      courseProgress: {
        with: {
          user: true,
          course: true,
        },
      },
    },
  });

  if (!certificate) {
    return { valid: false };
  }

  return {
    valid: true,
    userName: certificate.courseProgress.user.userName,
    courseTitle: certificate.courseProgress.course.title,
    issuedAt: certificate.issuedAt,
  };
};

export const verifyCertificateByFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const hash = createHash("sha256");
  hash.update(buffer);
  const fileHash = hash.digest("hex");

  return verifyCertificateByHash(fileHash);
};
