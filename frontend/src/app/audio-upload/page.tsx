'use client';

import React, { useState, useRef } from 'react';

export default function AudioUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverResponse, setServerResponse] = useState<{
    label?: string;
    confidence?: number;
    spectrogram_shape?: number[];
    [key: string]: unknown;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is WAV or MP3
      const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/x-wav'];
      const allowedExtensions = ['.wav', '.mp3'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setErrorMessage('Please select a WAV or MP3 audio file');
        setSelectedFile(null);
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setErrorMessage('');
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');
    setServerResponse(null);

    try {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }

      // Create WebSocket connection to audio endpoint
      const ws = new WebSocket('wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio');
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;
      
      // Wait for connection to open before sending data
      await new Promise<void>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error('WebSocket connection timeout'));
        }, 5000);

        const cleanup = () => {
          window.clearTimeout(timeoutId);
          ws.removeEventListener('open', onOpen);
          ws.removeEventListener('error', onError);
        };

        const onOpen = () => {
          cleanup();
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(new Error('Failed to connect to WebSocket'));
        };

        ws.addEventListener('open', onOpen);
        ws.addEventListener('error', onError);
      });
      
      // Send file metadata first
      const metadata = {
        type: 'metadata',
        filename: selectedFile.name,
        size: selectedFile.size,
        mimeType: selectedFile.type
      };
      ws.send(JSON.stringify(metadata));

      // Set up WebSocket event handlers
      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setUploadStatus('error');
        setErrorMessage('Connection error');
        try {
          ws.close();
        } catch {}
      });

      ws.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      });

      ws.addEventListener('message', (event) => {
        if (typeof event.data !== 'string') return;

        try {
          const data = JSON.parse(event.data) as { type?: string; [key: string]: unknown };
          if (data.type === 'progress') {
            if (typeof data.progress === 'number') {
              setUploadProgress(data.progress);
            }
          } else if (data.type === 'complete') {
            setUploadStatus('success');
            try {
              ws.close();
            } catch {}
          } else if (data.type === 'error') {
            setUploadStatus('error');
            setErrorMessage(typeof data.message === 'string' ? data.message : 'Upload failed');
          } else {
            // Handle any other JSON response from server
            setServerResponse(data);
            setUploadStatus('success');
            try {
              ws.close();
            } catch {}
          }
        } catch {
          return;
        }
      });

      // Read and send file in chunks
      const reader = new FileReader();
      const chunkSize = 64 * 1024; // 64KB chunks
      let offset = 0;

      const readNextChunk = () => {
        const slice = selectedFile.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(slice);
      };

      reader.onload = (e) => {
        if (e.target?.result && ws.readyState === WebSocket.OPEN) {
          const chunk = e.target.result as ArrayBuffer;
          ws.send(chunk);
          
          offset += chunk.byteLength;
          const progress = Math.round((offset / selectedFile.size) * 100);
          setUploadProgress(progress);

          if (offset < selectedFile.size) {
            readNextChunk();
          } else {
            ws.send(JSON.stringify({ type: 'complete' }));
          }
        } else if (ws.readyState !== WebSocket.OPEN) {
          setUploadStatus('error');
          setErrorMessage('WebSocket is not connected');
          try {
            ws.close();
          } catch {}
        }
      };

      reader.onerror = () => {
        setUploadStatus('error');
        setErrorMessage('Error reading file');
        try {
          ws.close();
        } catch {}
      };

      readNextChunk();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage('Failed to start upload');
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    }
  };

  const handleReset = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setServerResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-center">Audio File Upload</h1>
        
        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mpeg"
              onChange={handleFileSelect}
              className="hidden"
              id="audio-file-input"
            />
            <label htmlFor="audio-file-input" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {selectedFile ? selectedFile.name : 'Click to select audio file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  WAV and MP3 files only (max 10MB)
                </p>
              </div>
            </label>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded">
              <p className="text-sm">
                <strong>File:</strong> {selectedFile.name}<br />
                <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB<br />
                <strong>Type:</strong> {selectedFile.type || 'Unknown'}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'uploading' && (
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Uploading... {uploadProgress}%
            </p>
          )}
          
          {uploadStatus === 'success' && (
            <p className="text-green-600 dark:text-green-400 text-sm">
              ✅ Upload completed successfully!
            </p>
          )}

          {errorMessage && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              ❌ {errorMessage}
            </p>
          )}

          {/* Server Response Display */}
          {serverResponse && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded border">
              <h3 className="font-semibold mb-2">Server Analysis Result:</h3>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded border font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap wrap-break-word">
                  {JSON.stringify(serverResponse, null, 2)}
                </pre>
              </div>
              
              {/* Risk Level Badge */}
              {serverResponse.label && (
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                  serverResponse.label === 'High Risk' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : serverResponse.label === 'Medium Risk'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {serverResponse.label}
                  {serverResponse.confidence && (
                    <span className="ml-1">
                      ({Math.round(serverResponse.confidence * 100)}% confidence)
                    </span>
                  )}
                </div>
              )}
              
              {/* Spectrogram Info */}
              {serverResponse.spectrogram_shape && (
                <div className="mt-2 text-xs text-gray-600 dark:text-zinc-400">
                  Spectrogram shape: [{serverResponse.spectrogram_shape.join(', ')}]
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Audio'}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </div>
        </div>

        {/* WebSocket Status */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
          <p className="text-xs text-gray-600 dark:text-zinc-400">
            <strong>WebSocket Endpoint:</strong> wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio
          </p>
        </div>
      </div>
    </div>
  );
}
