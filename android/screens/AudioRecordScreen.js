/**
 * AudioRecordScreen - 3 attempts, 3 seconds each, then upload to backend.
 * Uses Expo AV for recording. Works offline until submit.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { WS_AUDIO_URL } from '../api';

const RECORD_DURATION_MS = 3000;
const MAX_ATTEMPTS = 3;

export default function AudioRecordScreen({ navigation }) {
  const [attempt, setAttempt] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uris, setUris] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission is required to record cough.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    })();
  }, []);

  // Cleanup: stop recording on unmount
  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
    };
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      setError('Failed to start recording: ' + (e.message || String(e)));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        setUris((prev) => [...prev, uri]);
        setAttempt((prev) => prev + 1);
      }
    } catch (e) {
      setError('Failed to stop recording: ' + (e.message || String(e)));
    }
  }, [recording]);

  // Auto-stop after 3 seconds when recording
  useEffect(() => {
    if (!isRecording) return;
    const t = setTimeout(stopRecording, RECORD_DURATION_MS);
    return () => clearTimeout(t);
  }, [isRecording, stopRecording]);

  const uploadAndNavigate = useCallback(async () => {
    if (uris.length === 0) {
      Alert.alert('No recordings', 'Record at least one cough sample.');
      return;
    }
    setUploading(true);
    setError(null);
    let ws = null;
    const CONNECT_TIMEOUT_MS = 20000; // 20s for slow mobile networks
    const CHUNK_SIZE = 64 * 1024; // 64KB like web frontend

    const connectWebSocket = () =>
      new Promise((resolve, reject) => {
        const socket = new WebSocket(WS_AUDIO_URL);
        socket.binaryType = 'arraybuffer';
        const t = setTimeout(() => {
          try {
            socket.close();
          } catch (_) {}
          reject(new Error('Connection timeout. Check Wi‑Fi or mobile data.'));
        }, CONNECT_TIMEOUT_MS);
        const cleanup = () => {
          clearTimeout(t);
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
        const onClose = (ev) => {
          if (!ev.wasClean) {
            cleanup();
            reject(new Error('Connection closed. Check network and server.'));
          }
        };
        socket.addEventListener('open', onOpen);
        socket.addEventListener('error', onError);
        socket.addEventListener('close', onClose);
      });

    try {
      // Use last recording (most recent attempt)
      const uri = uris[uris.length - 1];
      const response = await fetch(uri, { method: 'GET' });
      if (!response.ok) throw new Error('Could not read recording');
      const arrayBuffer = await response.arrayBuffer();
      const size = arrayBuffer.byteLength;

      // Open WebSocket with one retry (mobile networks can be flaky)
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

      // Wait for result — same as website: server sends { confidence, label, spectrogram_shape }
      const data = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('No response from server'));
        }, 45000);
        const cleanup = () => {
          clearTimeout(timeout);
          ws.removeEventListener('message', onMessage);
          ws.removeEventListener('error', onErr);
          ws.removeEventListener('close', onClose);
          try {
            ws.close();
          } catch (_) {}
        };
        const messageDataToString = (data) => {
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
          if (data && typeof data.toString === 'function') return data.toString();
          return '';
        };
        const onMessage = (event) => {
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
            // Same as website: treat { confidence, label, spectrogram_shape } as result
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
          // Don't reject here — server may close after sending result; rely on timeout if no message
          cleanup();
        };
        ws.addEventListener('message', onMessage);
        ws.addEventListener('error', onErr);
        ws.addEventListener('close', onClose);
      });

      navigation.navigate('Spectrogram', {
        flow: 'audio',
        audioResult: {
          confidence: data.confidence ?? 0,
          label: data.label ?? 'Unknown',
          spectrogram_shape: data.spectrogram_shape ?? [128, 131],
        },
      });
    } catch (e) {
      setError('Upload failed. ' + (e.message || String(e)));
      setUploading(false);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.close();
        } catch (_) {}
      }
    }
  }, [uris, navigation]);

  const canSubmit = uris.length > 0 && !uploading;
  const allDone = attempt >= MAX_ATTEMPTS;

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Record {MAX_ATTEMPTS} cough samples ({RECORD_DURATION_MS / 1000}s each).
      </Text>
      <Text style={styles.count}>
        Attempt {attempt} / {MAX_ATTEMPTS}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isRecording ? (
        <View style={styles.recordingRow}>
          <View style={styles.dot} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, attempt >= MAX_ATTEMPTS && styles.buttonDisabled]}
          onPress={startRecording}
          disabled={attempt >= MAX_ATTEMPTS || uploading}
        >
          <Text style={styles.buttonText}>
            {attempt >= MAX_ATTEMPTS ? 'Done' : 'Record'}
          </Text>
        </TouchableOpacity>
      )}
      {uploading && <ActivityIndicator size="large" color="#0f766e" style={styles.loader} />}
      {canSubmit && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={uploadAndNavigate}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {allDone ? 'Submit & Continue' : 'Submit & Continue'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0fdfa',
  },
  instruction: {
    fontSize: 16,
    color: '#134e4a',
    marginBottom: 16,
    textAlign: 'center',
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 16,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 18,
    color: '#dc2626',
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loader: {
    marginTop: 16,
  },
});
