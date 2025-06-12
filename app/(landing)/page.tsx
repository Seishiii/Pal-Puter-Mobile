import VerifyForm from "@/components/VerifyForm";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center p-6 min-h-screen">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center text-purple-300 mb-2">
          Verify Certificate
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter a hash or upload a certificate file to verify its authenticity
        </p>
        <VerifyForm />
      </div>
    </div>
  );
}
