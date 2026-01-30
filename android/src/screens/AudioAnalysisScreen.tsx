import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import PrimaryButton from '../components/PrimaryButton';
import { analyzeAudio, AudioAnalysisResult } from '../services/audioService';
import { colors } from '../utils/colors';

const RECORD_DURATION_MS = 3000;
const MAX_ATTEMPTS = 3;

// Recording options
// iOS: uses WAV (Linear PCM) which backend accepts
// Android: Try 3GP/AMR format which is simpler and some backends handle better
const RECORDING_OPTIONS: Audio.RecordingOptions = Platform.OS === 'ios'
  ? {
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      ios: {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
        extension: '.wav',
        outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    }
  : {
      // Android: Try 3GP with AMR_NB encoder - simpler format
      android: {
        extension: '.3gp',
        outputFormat: Audio.AndroidOutputFormat.THREE_GPP,
        audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
        sampleRate: 8000,
        numberOfChannels: 1,
        bitRate: 12200,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      web: {},
    };

interface AudioAnalysisScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function AudioAnalysisScreen({ navigation }: AudioAnalysisScreenProps) {
  const [attempt, setAttempt] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uris, setUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);

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
      // Use WAV recording options for backend compatibility
      const { recording: rec } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      setRecording(rec);
      setIsRecording(true);
    } catch (e: unknown) {
      setError('Failed to start recording: ' + (e instanceof Error ? e.message : String(e)));
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
    } catch (e: unknown) {
      setError('Failed to stop recording: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, [recording]);

  // Auto-stop after 3 seconds when recording
  useEffect(() => {
    if (!isRecording) return;
    const t = setTimeout(stopRecording, RECORD_DURATION_MS);
    return () => clearTimeout(t);
  }, [isRecording, stopRecording]);

  const uploadAndAnalyze = useCallback(async () => {
    if (uris.length === 0) {
      Alert.alert('No recordings', 'Record at least one cough sample.');
      return;
    }
    setUploading(true);
    setError(null);
    
    try {
      const uri = uris[uris.length - 1];
      const data = await analyzeAudio(uri);
      setResult(data);
    } catch (e: unknown) {
      setError('Upload failed. ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setUploading(false);
    }
  }, [uris]);

  const goToReport = () => {
    if (result) {
      navigation.navigate('Report', {
        flow: 'audio',
        audioResult: result,
      });
    }
  };

  const canSubmit = uris.length > 0 && !uploading && !result;
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
      ) : !result ? (
        <PrimaryButton
          title={attempt >= MAX_ATTEMPTS ? 'Done' : 'Record'}
          onPress={startRecording}
          disabled={attempt >= MAX_ATTEMPTS || uploading}
        />
      ) : null}

      {uploading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}

      {canSubmit && (
        <PrimaryButton
          title="Submit & Analyze"
          onPress={uploadAndAnalyze}
          disabled={uploading}
          variant="secondary"
          style={styles.submitButton}
        />
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Analysis Result</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Risk Label</Text>
            <Text style={styles.resultValue}>{result.label}</Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Confidence</Text>
            <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(1)}%</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Spectrogram</Text>
          <View style={styles.spectrogramContainer}>
            <SpectrogramGrid shape={result.spectrogram_shape} />
          </View>
          
          <PrimaryButton
            title="Generate Report"
            onPress={goToReport}
            style={styles.reportButton}
          />
        </View>
      )}
    </View>
  );
}

interface SpectrogramGridProps {
  shape: number[];
}

function SpectrogramGrid({ shape }: SpectrogramGridProps) {
  const width = shape[0] || 128;
  const height = shape[1] || 131;
  const cols = Math.min(20, Math.max(5, Math.floor(width / 8)));
  const rows = Math.min(15, Math.max(4, Math.floor(height / 10)));

  return (
    <View style={spectrogramStyles.wrapper}>
      <View style={[spectrogramStyles.grid, { width: cols * 14, height: rows * 14 }]}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={spectrogramStyles.row}>
            {Array.from({ length: cols }).map((_, j) => (
              <View
                key={j}
                style={[
                  spectrogramStyles.cell,
                  { opacity: 0.3 + (0.6 * (i + j)) / (rows + cols) },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const spectrogramStyles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: colors.spectrogramBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  grid: {
    flexDirection: 'column',
  } as ViewStyle,
  row: {
    flexDirection: 'row',
  } as ViewStyle,
  cell: {
    width: 12,
    height: 12,
    margin: 1,
    backgroundColor: colors.primary,
    borderRadius: 2,
  } as ViewStyle,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  } as ViewStyle,
  instruction: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  } as TextStyle,
  count: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  } as TextStyle,
  error: {
    color: colors.error,
    marginBottom: 16,
  } as TextStyle,
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  } as ViewStyle,
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.recordingDot,
    marginRight: 8,
  } as ViewStyle,
  recordingText: {
    fontSize: 18,
    color: colors.recordingDot,
  } as TextStyle,
  loader: {
    marginTop: 16,
  } as ViewStyle,
  submitButton: {
    marginTop: 16,
  } as ViewStyle,
  resultContainer: {
    marginTop: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,
  resultCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  } as ViewStyle,
  resultLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  } as TextStyle,
  resultValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  } as TextStyle,
  spectrogramContainer: {
    marginBottom: 16,
  } as ViewStyle,
  reportButton: {
    marginTop: 16,
  } as ViewStyle,
});
