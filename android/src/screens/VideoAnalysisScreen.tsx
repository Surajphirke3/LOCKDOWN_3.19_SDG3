import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import PrimaryButton from '../components/PrimaryButton';
import { analyzeAudio, AudioAnalysisResult } from '../services/audioService';
import { colors } from '../utils/colors';

const RECORD_DURATION_MS = 3000; // 3 seconds
const MAX_ATTEMPTS = 3;

interface VideoAnalysisScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function VideoAnalysisScreen({ navigation }: VideoAnalysisScreenProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [attempt, setAttempt] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUris, setAudioUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const cameraRef = useRef<CameraView>(null);
  const audioRecordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial permission request
  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain) {
      requestCameraPermission(); 
    }
    if (micPermission && !micPermission.granted && micPermission.canAskAgain) {
       requestMicPermission();
    }
  }, [cameraPermission, micPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRecordingRef.current) {
        audioRecordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    if (!isCameraReady) {
      Alert.alert('Camera not ready', 'Please wait for camera to initialize.');
      return;
    }
    
    try {
      setIsRecording(true);
      setError(null);
      setRecordingDuration(0);
      console.log('[VideoScreen] Starting audio recording (with video preview)...');
      
      // Request audio permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is required.');
        setIsRecording(false);
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create audio recording
      console.log('[VideoScreen] Creating audio recording...');
      const recording = new Audio.Recording();
      
      // Platform-specific recording configuration
      // iOS: Use WAV (LinearPCM) - directly supported by backend
      // Android: Use M4A (AAC) - backend needs FFmpeg to decode
      const recordingOptions: Audio.RecordingOptions = Platform.OS === 'ios' 
        ? {
            isMeteringEnabled: true,
            android: Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            ios: {
              extension: '.wav',
              outputFormat: Audio.IOSOutputFormat.LINEARPCM,
              audioQuality: Audio.IOSAudioQuality.MAX,
              sampleRate: 16000,
              numberOfChannels: 1,
              bitRate: 256000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
            web: {
              mimeType: 'audio/wav',
              bitsPerSecond: 256000,
            },
          }
        : Audio.RecordingOptionsPresets.HIGH_QUALITY;
      
      await recording.prepareToRecordAsync(recordingOptions);

      await recording.startAsync();
      audioRecordingRef.current = recording;
      console.log('[VideoScreen] Audio recording started');
      
      // Timer for duration display
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after duration
      setTimeout(async () => {
        await stopRecording();
      }, RECORD_DURATION_MS);
      
    } catch (e: unknown) {
      setIsRecording(false);
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error('[VideoScreen] Recording error:', errMsg);
      setError('Recording failed: ' + errMsg);
    }
  };

  const stopRecording = async () => {
    console.log('[VideoScreen] Stopping recording...');
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop audio recording
    if (!audioRecordingRef.current) {
      setIsRecording(false);
      return;
    }

    try {
      await audioRecordingRef.current.stopAndUnloadAsync();
      const uri = audioRecordingRef.current.getURI();
      console.log('[VideoScreen] Audio recording saved to:', uri);
      
      audioRecordingRef.current = null;
      setIsRecording(false);
      
      if (uri) {
        setAudioUris((prev) => [...prev, uri]);
        setAttempt((prev) => prev + 1);
      }
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (e) {
      console.error('[VideoScreen] Stop error:', e);
      setIsRecording(false);
    }
  };

  const uploadAndAnalyze = useCallback(async () => {
    if (audioUris.length === 0) {
      Alert.alert('No recordings', 'Record at least one cough audio sample.');
      return;
    }
    
    // Show platform-specific warning on Android
    if (Platform.OS === 'android') {
      console.log('[VideoScreen] ⚠️ Android detected - sending M4A audio');
      console.log('[VideoScreen] Backend must support M4A or have FFmpeg installed');
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Use the last recorded audio
      const uri = audioUris[audioUris.length - 1];
      console.log('[VideoScreen] Analyzing audio:', uri);
      
      // Send as audio file (recorded from microphone while video preview was showing)
      const data = await analyzeAudio(uri, false);
      setResult(data);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('[VideoScreen] Upload error:', errorMsg);
      
      // Provide helpful error message for Android M4A issues
      if (Platform.OS === 'android' && errorMsg.includes('format')) {
        setError(
          'Audio format not supported by backend. ' +
          'Android records M4A files. Please contact backend team to add M4A support.'
        );
      } else {
        setError('Upload failed: ' + errorMsg);
      }
    } finally {
      setUploading(false);
    }
  }, [audioUris]);

  const goToReport = () => {
    if (result) {
      navigation.navigate('Report', {
        flow: 'video', 
        audioResult: result,
      });
    }
  };

  const canSubmit = audioUris.length > 0 && !uploading && !result;
  const allDone = attempt >= MAX_ATTEMPTS;

  // Permissions loading check
  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  // Permissions failed check
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Camera and Microphone permissions are required.</Text>
        {!cameraPermission.granted && (
          <PrimaryButton title="Grant Camera Permission" onPress={requestCameraPermission} style={{ marginBottom: 8 }} />
        )}
        {!micPermission.granted && (
          <PrimaryButton title="Grant Mic Permission" onPress={requestMicPermission} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Cough Video Analysis</Text>
      
      <Text style={styles.instruction}>
        Record your cough ({RECORD_DURATION_MS / 1000}s). Video preview shows your face,{'\n'}
        while audio is captured and sent for analysis.
      </Text>
      
      <Text style={styles.count}>
        Recording {attempt} / {MAX_ATTEMPTS}
      </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Camera Preview - for visual display only */}
      {!result && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={cameraType}
            ref={cameraRef}
            onCameraReady={() => {
              console.log('Camera is ready');
              setIsCameraReady(true);
            }}
          />
          <View style={styles.cameraOverlay} pointerEvents="none">
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.dot} />
                <Text style={styles.recText}>REC {recordingDuration}s</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setCameraType(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Text style={styles.flipText}>Flip</Text>
          </TouchableOpacity>
          
          {/* Audio indicator */}
          <View style={styles.audioIndicator}>
            <Text style={styles.audioText}>🎤 Audio Recording</Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.uploadingText}>Analyzing cough audio...</Text>
          </View>
        ) : !result ? (
          <>
            <PrimaryButton
              title={isRecording ? `Recording... ${recordingDuration}s` : allDone ? 'Done' : 'Record Cough'}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={allDone && !isRecording}
              style={styles.recordButton}
              variant={isRecording ? 'secondary' : 'primary'}
            />
            
            {canSubmit && (
              <PrimaryButton
                title="Submit & Analyze"
                onPress={uploadAndAnalyze}
                variant="secondary"
                style={styles.submitButton}
              />
            )}
          </>
        ) : (
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
              
              <PrimaryButton
                title="Generate Report"
                onPress={goToReport}
                style={styles.reportButton}
              />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  } as ViewStyle,
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  instruction: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  } as TextStyle,
  error: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  } as TextStyle,
  cameraContainer: {
    height: 280,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
    position: 'relative',
  } as ViewStyle,
  camera: {
    flex: 1,
  } as ViewStyle,
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 12,
    zIndex: 1,
  } as ViewStyle,
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  } as ViewStyle,
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 6,
  } as ViewStyle,
  recText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  } as TextStyle,
  flipButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 2,
  } as ViewStyle,
  flipText: {
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
  audioIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 2,
  } as ViewStyle,
  audioText: {
    color: '#fff',
    fontSize: 12,
  } as TextStyle,
  controls: {
    flex: 1,
  } as ViewStyle,
  recordButton: {
    marginBottom: 12,
  } as ViewStyle,
  submitButton: {
    marginBottom: 12,
  } as ViewStyle,
  uploadingContainer: {
    alignItems: 'center',
  } as ViewStyle,
  uploadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  resultContainer: {
    marginTop: 0,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
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
  reportButton: {
    marginTop: 16,
  } as ViewStyle,
});
