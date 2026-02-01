"use client";

import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  // Mocked data (replace with backend later)
  const result = {
    score: 80,
    risk: "High",
    confidence: 87,
    age: 32,
    coughDays: 24,
    fever: true,
    smoker: true,
    hospital: {
      name: "City General Hospital",
      distance: "2.3 km",
      direction: "Head north on Main Street",
    },
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Assessment Report</h1>
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Risk Score */}
        <div className="rounded-2xl border border-red-300 bg-red-50 p-8 text-center">
          <div className="mx-auto w-28 h-28 rounded-full border-4 border-red-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-red-600">
              {result.score}
            </span>
          </div>

          <span className="mt-4 inline-block px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            HIGH RISK
          </span>

          <p className="mt-3 text-sm text-gray-600">
            High risk detected. Please consult a healthcare professional immediately.
          </p>
        </div>

        {/* Cough Analysis */}
        <div className="rounded-2xl border bg-white p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Cough Analysis</h3>
            <p className="font-medium">Audio pattern recognition</p>
            <p className="text-sm text-gray-500 mt-3">Confidence</p>
            <p className="text-xl font-semibold text-emerald-600">
              {result.confidence}%
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
              Assessment: High Risk
            </span>
          </div>
        </div>

        {/* Medical Information */}
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="text-sm text-gray-500 mb-4">Medical Information</h3>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              Age: <span className="font-medium">{result.age} years</span>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              Cough Duration:{" "}
              <span className="font-medium">{result.coughDays} days</span>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              Fever:{" "}
              <span className="font-medium">
                {result.fever ? "Yes" : "No"}
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              Smoker:{" "}
              <span className="font-medium">
                {result.smoker ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* What Next */}
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
          <h3 className="text-center font-semibold mb-2">
            What Should You Do Next?
          </h3>

          <p className="text-center text-sm text-gray-700 mb-4">
            Your screening indicates a{" "}
            <span className="text-red-600 font-medium">high level of risk</span>.
            We strongly recommend consulting a healthcare professional.
          </p>

          <div className="rounded-lg bg-white border border-red-200 p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Nearest Hospital</p>
              <p className="text-red-600 font-medium">
                {result.hospital.name}
              </p>
              <p className="text-xs text-gray-500">
                {result.hospital.distance} • {result.hospital.direction}
              </p>
            </div>
            <span className="text-red-500 text-xl">›</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-500">
          This is a screening tool, not a medical diagnosis. A healthcare
          professional will provide proper evaluation and care.
        </p>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button className="py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
            Download
          </button>
          <button className="py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
            Share
          </button>
        </div>

        <button
          onClick={() => router.push("/screening")}
          className="w-full py-4 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
        >
          Start New Assessment
        </button>
      </div>
    </main>
  );
}
