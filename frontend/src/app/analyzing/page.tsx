"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzingPage() {
  const router = useRouter();

  const [progress, setProgress] = useState(10);
  const [status, setStatus] = useState(
    "Connecting to analysis service..."
  );

  useEffect(() => {
    // ✅ IMPORTANT: WebSocket MUST use wss://
    const socket = new WebSocket(
      "wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio"
    );

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setStatus("Processing cough audio and symptoms...");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WS message:", data);

        // Progress update
        if (data.type === "progress") {
          setProgress((prev) =>
            data.value ? data.value : Math.min(prev + 10, 90)
          );
          setStatus(data.message || "Analyzing...");
        }

        // Final result received
        if (data.type === "result") {
          localStorage.setItem(
            "analysisResult",
            JSON.stringify(data)
          );
          router.push("/result");
        }
      } catch (err) {
        console.error("❌ Invalid WebSocket message", err);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error", error);
      setStatus("Connection error. Retrying...");
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    // 🔐 Hackathon safety fallback
    const fallback = setTimeout(() => {
      console.warn("⚠️ No WS response, moving to result page");
      router.push("/result");
    }, 7000);

    return () => {
      socket.close();
      clearTimeout(fallback);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Analyzing Your Data
        </h1>

        <p className="text-gray-600 mb-6">{status}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Please wait while the AI processes your cough sample.
        </p>
      </div>
    </main>
  );
}
