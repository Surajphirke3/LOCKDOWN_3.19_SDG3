/**
 * Audio Service - WebSocket connection to backend for cough audio analysis
 */

const WS_AUDIO_URL = 'wss://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/ws/audio';
const CONNECT_TIMEOUT_MS = 20000;
const RESPONSE_TIMEOUT_MS = 45000;
const CHUNK_SIZE = 64 * 1024;

export interface AudioAnalysisResult {
  confidence: number;
  label: string;
  spectrogram_shape: number[];
}

const connectWebSocket = (): Promise<WebSocket> =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(WS_AUDIO_URL);
    socket.binaryType = 'arraybuffer';
    
    const timeout = setTimeout(() => {
      try {
        socket.close();
      } catch (_) {}
      reject(new Error('Connection timeout. Check Wi‑Fi or mobile data.'));
    }, CONNECT_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('close', onClose);
    };

    const onOpen = () => {
      cleanup();
      resolve(socket);
    };

    const onError = () => {
      cleanup();
      reject(new Error('Connection failed'));
    };

    const onClose = (ev: CloseEvent) => {
      if (!ev.wasClean) {
        cleanup();
        reject(new Error('Connection closed. Check network and server.'));
      }
    };

    socket.addEventListener('open', onOpen);
    socket.addEventListener('error', onError);
    socket.addEventListener('close', onClose);
  });

const messageDataToString = (data: unknown): string => {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(data);
    }
    const u8 = new Uint8Array(data);
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return s;
  }
  if (data && typeof (data as { toString?: () => string }).toString === 'function') {
    return (data as { toString: () => string }).toString();
  }
  return '';
};

export const analyzeAudio = async (audioUri: string): Promise<AudioAnalysisResult> => {
  const response = await fetch(audioUri, { method: 'GET' });
  if (!response.ok) throw new Error('Could not read recording');
  
  const arrayBuffer = await response.arrayBuffer();
  const size = arrayBuffer.byteLength;

  // Connect with one retry for flaky mobile networks
  let ws: WebSocket;
  try {
    ws = await connectWebSocket();
  } catch (firstErr) {
    ws = await connectWebSocket();
  }

  // Send metadata first
  ws.send(JSON.stringify({
    type: 'metadata',
    filename: 'cough.m4a',
    size,
    mimeType: 'audio/m4a',
  }));

  // Send file in chunks
  const bytes = new Uint8Array(arrayBuffer);
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, bytes.length);
    ws.send(bytes.slice(offset, end).buffer);
  }
  ws.send(JSON.stringify({ type: 'complete' }));

  // Wait for result
  return new Promise<AudioAnalysisResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('No response from server'));
    }, RESPONSE_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      ws.removeEventListener('message', onMessage);
      ws.removeEventListener('error', onErr);
      ws.removeEventListener('close', onClose);
      try {
        ws.close();
      } catch (_) {}
    };

    const onMessage = (event: MessageEvent) => {
      const raw = messageDataToString(event.data);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.type === 'error') {
          cleanup();
          reject(new Error(parsed.message || parsed.error || 'Upload failed'));
          return;
        }
        if (parsed.type === 'progress') return;
        
        const hasResult = typeof parsed.confidence === 'number' || typeof parsed.label === 'string';
        if (hasResult || parsed.type === 'complete') {
          cleanup();
          resolve({
            confidence: parsed.confidence ?? 0,
            label: parsed.label ?? 'Unknown',
            spectrogram_shape: Array.isArray(parsed.spectrogram_shape)
              ? parsed.spectrogram_shape
              : [128, 131],
          });
        }
      } catch (_) {}
    };

    const onErr = () => {
      cleanup();
      reject(new Error('Connection error'));
    };

    const onClose = () => {
      cleanup();
    };

    ws.addEventListener('message', onMessage);
    ws.addEventListener('error', onErr);
    ws.addEventListener('close', onClose);
  });
};
