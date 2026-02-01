"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DetailsPage() {
  const router = useRouter();

  const [age, setAge] = useState("");
  const [coughDays, setCoughDays] = useState("");
  const [fever, setFever] = useState(false);
  const [smoker, setSmoker] = useState(false);

  const submitDetails = async () => {
    // Send metadata to backend
    await fetch(
      "https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/api/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          cough_days: coughDays,
          fever,
          smoker,
        }),
      }
    );

    router.push("/analyzing");
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Additional Information</h1>

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="number"
          placeholder="Cough duration (days)"
          value={coughDays}
          onChange={(e) => setCoughDays(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <label className="flex gap-2">
          <input type="checkbox" onChange={(e) => setFever(e.target.checked)} />
          Fever
        </label>

        <label className="flex gap-2">
          <input type="checkbox" onChange={(e) => setSmoker(e.target.checked)} />
          Smoker
        </label>

        <button
          onClick={submitDetails}
          className="w-full py-3 bg-emerald-600 text-white rounded-lg"
        >
          Submit & Analyze
        </button>
      </div>
    </main>
  );
}
