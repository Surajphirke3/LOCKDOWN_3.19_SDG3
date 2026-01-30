import Link from "next/link";
import WebSocketClient from "../components/WebSocketClient";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-center">CoughLock</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          Lock TB early. Act faster.
        </p>
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Link href="/audio-upload" className="block">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <h2 className="text-lg font-semibold mb-2">🎤 Audio Upload</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Upload cough audio for TB risk analysis
              </p>
            </div>
          </Link>
          
          <Link href="/cough-prediction" className="block">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <h2 className="text-lg font-semibold mb-2">📊 Risk Prediction</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enter details for medical risk score
              </p>
            </div>
          </Link>
          
          <Link href="/health-assistant" className="block md:col-span-2">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <h2 className="text-lg font-semibold mb-2">🏥 Health Assistant</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ask questions about your health and find nearby hospitals
              </p>
            </div>
          </Link>
        </div>

        {/* WebSocket Status */}
        <div className="w-full mt-8">
          <p className="text-xs text-center text-zinc-500 mb-4">Backend Status:</p>
          <WebSocketClient />
        </div>
      </main>
    </div>
  );
}
