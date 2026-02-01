"use client";

import { useRef, useState } from "react";

export default function ScreeningPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");

  // ▶️ Start recording + open WebSocket
  const startRecording = async () => {
    if (isRecording) return;

    setStatus("Starting recording...");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Open WebSocket (audio streaming)
    socketRef.current = new WebSocket(
      "wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio"
    );

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setStatus("Recording in progress...");
    };

    socketRef.current.onerror = (e) => {
      console.error("❌ WebSocket error", e);
      setStatus("WebSocket connection error");
    };

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      setStatus("Sending data to backend...");

      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      // 🔥 SEND BINARY DATA VIA WEBSOCKET
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(blob);
        socketRef.current.close();
        console.log("✅ Audio/video sent via WebSocket");
        setStatus("Data sent successfully");
      } else {
        console.warn("WebSocket not open");
        setStatus("Failed to send data");
      }

      // Cleanup video preview
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    recorder.start();
    setIsRecording(true);
  };

  // ⏹ Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-semibold mb-4">
          TB Screening
        </h1>

        <p className="text-gray-600 mb-6">
          Record a short cough video. The audio is sent directly to the backend
          for AI analysis.
        </p>

        {/* Live Preview */}
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full rounded-lg border bg-black mb-6"
        />

        {/* Consent */}
        <div className="flex items-start gap-3 mb-6 text-left">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 accent-emerald-600"
          />
          <p className="text-sm text-gray-600">
            I understand this is a screening tool and not a medical diagnosis.
          </p>
        </div>

        {/* Controls */}
        {!isRecording ? (
          <button
            disabled={!consent}
            onClick={startRecording}
            className={`w-full py-3 rounded-lg font-medium transition ${
              consent
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Stop Recording
          </button>
        )}

        {/* Status Card */}
        {status && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
            <h3 className="font-semibold text-emerald-700 mb-1">
              Status
            </h3>
            <p className="text-gray-700 text-sm">{status}</p>
          </div>
        )}
      </div>
    </main>
  );
}
