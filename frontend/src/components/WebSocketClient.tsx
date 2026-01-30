'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

export default function WebSocketClient() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  // Default WebSocket URL - ASK YOUR FRIEND FOR THE CORRECT PATH
  // Common paths: /ws, /websocket, /socket, /stream
  const [wsUrl, setWsUrl] = useState('wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws');
  const [lastError, setLastError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const addMessage = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, `[${timestamp}] ${msg}`]);
  }, []);

  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setLastError(null);
    setIsConnecting(true);
    
    // Convert http/https to ws/wss if needed
    let finalUrl = wsUrl.trim();
    if (finalUrl.startsWith('https://')) {
      finalUrl = finalUrl.replace('https://', 'wss://');
    } else if (finalUrl.startsWith('http://')) {
      finalUrl = finalUrl.replace('http://', 'ws://');
    } else if (!finalUrl.startsWith('ws://') && !finalUrl.startsWith('wss://')) {
      finalUrl = 'wss://' + finalUrl;
    }

    addMessage(`Connecting to: ${finalUrl}`);

    try {
      const ws = new WebSocket(finalUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setLastError(null);
        addMessage('✅ Connected successfully!');
      };

      ws.onmessage = (event) => {
        addMessage(`📥 Received: ${event.data}`);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        socketRef.current = null;
        
        const closeReason = event.reason || getCloseCodeDescription(event.code);
        addMessage(`❌ Disconnected (Code: ${event.code}) - ${closeReason}`);
        
        if (event.code !== 1000) {
          setLastError(`Connection closed: ${closeReason}`);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        
        // Check for common issues
        let errorMsg = 'Connection failed. ';
        if (window.location.protocol === 'https:' && wsUrl.includes('ws://')) {
          errorMsg += 'Mixed content error: Cannot connect to ws:// from https:// page. Use wss:// instead.';
        } else {
          errorMsg += 'Check: 1) Is the server running? 2) Is the WebSocket path correct? 3) Is CORS enabled?';
        }
        
        addMessage(`⚠️ Error: ${errorMsg}`);
        setLastError(errorMsg);
      };

    } catch (error) {
      setIsConnecting(false);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addMessage(`⚠️ Failed to create WebSocket: ${errorMsg}`);
      setLastError(errorMsg);
    }
  }, [wsUrl, addMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected');
      addMessage('Disconnecting...');
    }
  }, [addMessage]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socketRef.current && isConnected && inputMessage.trim()) {
      socketRef.current.send(inputMessage);
      addMessage(`📤 Sent: ${inputMessage}`);
      setInputMessage('');
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setLastError(null);
  };

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg shadow-lg bg-white dark:bg-zinc-900 w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">WebSocket Client</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full animate-pulse ${
            isConnecting ? 'bg-yellow-500' : isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span className="text-sm font-medium">
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* URL Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-600 dark:text-zinc-400">
          WebSocket URL (use wss:// for secure connection):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            disabled={isConnected || isConnecting}
            className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-50 font-mono text-sm"
            placeholder="wss://your-server.com/ws"
          />
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isConnecting
                ? 'bg-yellow-500 text-white cursor-wait'
                : isConnected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          <strong>Error:</strong> {lastError}
        </div>
      )}

      {/* Common Paths Hint */}
      <div className="text-xs text-zinc-500 dark:text-zinc-500">
        💡 <strong>Tip:</strong> Common WebSocket paths: <code>/ws</code>, <code>/websocket</code>, <code>/socket</code>, <code>/stream</code>. 
        Ask your friend for the correct endpoint path.
      </div>

      {/* Messages Area */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Messages:</span>
        <button
          onClick={clearMessages}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          Clear
        </button>
      </div>
      <div className="h-64 overflow-y-auto border rounded p-4 bg-gray-50 dark:bg-zinc-950 dark:border-zinc-800 font-mono text-sm">
        {messages.length === 0 ? (
          <p className="text-gray-400 italic">No messages yet. Click Connect to start.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-1 wrap-break-word">
              {msg}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Form */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
          className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-50"
          placeholder={isConnected ? "Type a message..." : "Connect first to send messages"}
        />
        <button
          type="submit"
          disabled={!isConnected || !inputMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Helper function to describe WebSocket close codes
function getCloseCodeDescription(code: number): string {
  const codes: Record<number, string> = {
    1000: 'Normal closure',
    1001: 'Going away (page closing)',
    1002: 'Protocol error',
    1003: 'Unsupported data',
    1005: 'No status received',
    1006: 'Abnormal closure (connection lost or blocked)',
    1007: 'Invalid frame payload data',
    1008: 'Policy violation',
    1009: 'Message too big',
    1010: 'Mandatory extension missing',
    1011: 'Internal server error',
    1012: 'Service restart',
    1013: 'Try again later',
    1014: 'Bad gateway',
    1015: 'TLS handshake failure',
  };
  return codes[code] || 'Unknown reason';
}