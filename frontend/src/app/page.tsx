import WebSocketClient from "../components/WebSocketClient";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-center">Backend WebSocket Test</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-400">
          Testing connection to: <code className="bg-gray-200 dark:bg-zinc-800 px-1 py-0.5 rounded">https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/</code>
        </p>
        <WebSocketClient />
      </main>
    </div>
  );
}
