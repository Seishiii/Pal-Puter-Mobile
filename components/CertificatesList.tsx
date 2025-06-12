"use client";

import { downloadCertificate } from "@/actions/download-certificate";
import { useState, useTransition } from "react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DownloadIcon } from "lucide-react";
import Image from "next/image";

interface Certificate {
  id: number;
  courseTitle: string;
  issuedAt: Date;
  hash: string;
  fileName: string;
}

const CertificatesList = ({
  initialCertificates,
}: {
  initialCertificates: Certificate[] | null;
}) => {
  const [isPending, startTransition] = useTransition();
  const [certificates] = useState(initialCertificates);

  const handleDownload = async (certId: number) => {
    startTransition(async () => {
      try {
        const { fileName, mimeType, fileData } = await downloadCertificate(
          certId
        );

        // Create blob from Uint8Array
        const blob = new Blob([fileData], { type: mimeType });

        // Save file using file-saver
        saveAs(blob, fileName);

        toast.success("Certificate downloaded successfully");
      } catch (error) {
        toast.error("Failed to download certificate");
        console.error(error);
      }
    });
  };

  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-23 h-23 mx-auto mb-4">
          <Image
            src="/mascot_sad.PNG"
            alt="Sad Mascot"
            height={100}
            width={100}
          />
        </div>
        <h3 className="text-xl font-medium text-white">No certificates yet</h3>
        <p className="text-white mt-2">Complete courses to earn certificates</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {certificates.map((cert) => (
        <Card key={cert.id} className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
            <p className="text-sm text-gray-200">
              Issued on {cert.issuedAt.toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-white">Certificate ID</p>
                <p className="font-mono text-xs text-gray-300 truncate max-w-[120px]">
                  {cert.hash}
                </p>
              </div>
            </div>
            <Button
              variant="primaryOutline"
              className="gap-2"
              onClick={() => handleDownload(cert.id)}
              disabled={isPending}
            >
              <DownloadIcon size={16} />
              {isPending ? "Downloading..." : "Download"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CertificatesList;
