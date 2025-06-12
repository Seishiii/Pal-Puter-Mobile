"use client";

import {
  verifyCertificateByFile,
  verifyCertificateByHash,
} from "@/actions/verify-certificate";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const VerifyForm = () => {
  const [hash, setHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    valid: boolean;
    userName?: string;
    courseTitle?: string;
    issuedAt?: Date;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"hash" | "file">("hash");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (method === "hash" && hash) {
        const res = await verifyCertificateByHash(hash);
        setResult(res);
      } else if (method === "file" && file) {
        const res = await verifyCertificateByFile(file);
        setResult(res);
      }
    } catch (error) {
      setResult({ valid: false });
      console.error("Failed to verify certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex border-b border-purple-200 mb-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-center ${
            method === "hash"
              ? "border-b-2 border-purple-500 text-purple-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setMethod("hash")}
        >
          Hash Verification
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-center ${
            method === "file"
              ? "border-b-2 border-purple-500 text-purple-600 font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setMethod("file")}
        >
          File Upload
        </button>
      </div>

      {method === "hash" ? (
        <div>
          <label
            htmlFor="hash"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Certificate Hash
          </label>
          <Input
            id="hash"
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Enter certificate hash"
            className="w-full p-3 border border-black text-black rounded-lg"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Certificate
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <p className="text-sm text-gray-500">{file.name}</p>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold">
                        Click to upload certificate file
                      </span>
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg"
              />
            </label>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full py-3 rounded-xl"
        disabled={
          loading ||
          (method === "hash" && !hash) ||
          (method === "file" && !file)
        }
      >
        {loading ? "Verifying..." : "Verify Certificate"}
      </Button>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.valid
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {result.valid ? (
            <div>
              <h3 className="font-bold text-lg mb-2">
                ✓ Certificate Verified!
              </h3>
              <p>Issued to: {result.userName}</p>
              <p>Course: {result.courseTitle}</p>
              <p>Issued on: {result.issuedAt?.toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="font-medium">❌ Certificate could not be verified</p>
          )}
        </div>
      )}
    </form>
  );
};

export default VerifyForm;
