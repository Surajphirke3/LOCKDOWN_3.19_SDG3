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
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType } from 'expo-camera';
import PrimaryButton from '../components/PrimaryButton';
import { analyzeAudio, AudioAnalysisResult } from '../services/audioService';
import { colors } from '../utils/colors';

const RECORD_DURATION_MS = 3000;
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
  const [uris, setUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);

  // Initial permission request
  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain) {
      requestCameraPermission(); 
    }
    if (micPermission && !micPermission.granted && micPermission.canAskAgain) {
       requestMicPermission();
    }
  }, [cameraPermission, micPermission]);

  const startRecording = async () => {
    if (!isCameraReady) {
      Alert.alert('Camera not ready', 'Please wait for camera to initialize.');
      return;
    }
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setError(null);
        console.log('Starting recording (manual stop)...');
        
        // Start recording without options to see if options caused the error
        // We will manually stop after 3 seconds
        const videoRecordPromise = cameraRef.current.recordAsync({});

        // Manual stop timer
        setTimeout(() => {
          if (cameraRef.current) {
            console.log('Stopping recording...');
            try {
              cameraRef.current.stopRecording();
            } catch (err) {
              console.error('Failed to stop recording:', err);
            }
          }
        }, RECORD_DURATION_MS);

        // Wait for result
        const data = await videoRecordPromise;
        console.log('Recording finished:', data?.uri);
        
        setIsRecording(false);
        
        if (data && data.uri) {
          setUris((prev) => [...prev, data.uri]);
          setAttempt((prev) => prev + 1);
        }
      } catch (e: unknown) {
        setIsRecording(false);
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('Recording error:', errMsg);
        
        if (errMsg.includes('Unknown error')) {
             setError('Recording failed (Unknown error). If you are on an emulator, please enable Camera/Audio or use a real device.');
        } else {
             setError('Recording failed: ' + errMsg);
        }
      }
    } else {
        console.log('Camera ref not valid or already recording');
    }
  };

  const uploadAndAnalyze = useCallback(async () => {
    if (uris.length === 0) {
      Alert.alert('No recordings', 'Record at least one video sample.');
      return;
    }
    setUploading(true);
    setError(null);
    
    try {
      // Use the last recorded video
      const uri = uris[uris.length - 1];
      console.log('Analyzing video:', uri);
      
      // Pass isVideo = true
      const data = await analyzeAudio(uri, true);
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
        flow: 'video', 
        audioResult: result,
      });
    }
  };

  const canSubmit = uris.length > 0 && !uploading && !result;
  const allDone = attempt >= MAX_ATTEMPTS;

  // Permissions loading check
  if (!cameraPermission || !micPermission) {
    return <View style={styles.container} />;
  }

  // Permissions failed check
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Camera and Microphone permissions are required to record video.</Text>
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
      <Text style={styles.instruction}>
        Record {MAX_ATTEMPTS} cough videos ({RECORD_DURATION_MS / 1000}s each).
      </Text>
      <Text style={styles.count}>
        Attempt {attempt} / {MAX_ATTEMPTS}
      </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Camera Preview */}
      {!result && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={cameraType}
            mode="video"
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
                <Text style={styles.recText}>REC</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setCameraType(current => (current === 'back' ? 'front' : 'back'))}
          >
            <Text style={styles.flipText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {uploading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : !result ? (
          <>
            <PrimaryButton
              title={isRecording ? 'Recording...' : attempt >= MAX_ATTEMPTS ? 'Done' : 'Record Video'}
              onPress={startRecording}
              disabled={isRecording || attempt >= MAX_ATTEMPTS}
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
    textAlign: 'center',
  } as TextStyle,
  cameraContainer: {
    height: 300,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#000',
    position: 'relative', // Ensure absolute children position correctly
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
    padding: 16,
    zIndex: 1,
  } as ViewStyle,
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  } as ViewStyle,
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
    marginRight: 8,
  } as ViewStyle,
  recText: {
    color: '#fff',
    fontWeight: 'bold',
  } as TextStyle,
  flipButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
    zIndex: 2,
  } as ViewStyle,
  flipText: {
    color: '#fff',
  } as TextStyle,
  controls: {
    flex: 1,
  } as ViewStyle,
  recordButton: {
    marginBottom: 16,
  } as ViewStyle,
  submitButton: {
    marginBottom: 16,
  } as ViewStyle,
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
