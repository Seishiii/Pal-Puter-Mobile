import CertificatesList from "@/components/CertificatesList";
import { getUserCertificates } from "@/db/queries";

const CertificatesPage = async () => {
  const certificates = await getUserCertificates();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">
        Your Certificates
      </h1>
      <CertificatesList initialCertificates={certificates} />
    </div>
  );
};

export default CertificatesPage;
