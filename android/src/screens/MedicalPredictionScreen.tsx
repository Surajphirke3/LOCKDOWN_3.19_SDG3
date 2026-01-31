import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { predictRisk, MedicalInput, PredictionResult } from '../services/predictionService';
import { colors } from '../utils/colors';

interface MedicalPredictionScreenProps {
  route: {
    params?: {
      flow?: string;
    };
  };
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function MedicalPredictionScreen({ route, navigation }: MedicalPredictionScreenProps) {
  const { flow } = route.params || {};
  
  // Basic Info
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  
  // Symptoms - all strings "Yes" or "No"
  const [coughDays, setCoughDays] = useState('');
  const [fever, setFever] = useState<'Yes' | 'No'>('No');
  const [weightLoss, setWeightLoss] = useState('');
  const [nightSweats, setNightSweats] = useState<'Yes' | 'No'>('No');
  const [chestPain, setChestPain] = useState<'Yes' | 'No'>('No');
  const [hemoptysis, setHemoptysis] = useState<'Yes' | 'No'>('No');
  const [breathlessness, setBreathlessness] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  
  // History - all strings "Yes" or "No"
  const [contactHistory, setContactHistory] = useState<'Yes' | 'No'>('No');
  const [travelHistory, setTravelHistory] = useState<'Yes' | 'No'>('No');
  const [hivStatus, setHivStatus] = useState<'Positive' | 'Negative'>('Negative');
  const [previousTB, setPreviousTB] = useState<'Yes' | 'No'>('No');
  
  // Test Results
  const [chestXRay, setChestXRay] = useState<'Normal' | 'Abnormal'>('Normal');
  const [sputumTest, setSputumTest] = useState<'Positive' | 'Negative'>('Negative');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const submit = async () => {
    const ageNum = parseInt(age, 10);
    const coughNum = parseInt(coughDays, 10);
    const weightLossNum = parseFloat(weightLoss) || 0;
    
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError('Please enter a valid age (0–120).');
      return;
    }
    if (isNaN(coughNum) || coughNum < 0) {
      setError('Please enter valid cough days (0 or more).');
      return;
    }
    setError(null);
    setSubmitting(true);
    
    try {
      const input: MedicalInput = {
        Age: ageNum,
        Gender: gender,
        Cough: coughNum,
        Fever: fever,
        WeightLoss: weightLossNum,
        NightSweats: nightSweats,
        ChestPain: chestPain,
        Hemoptysis: hemoptysis,
        Breathlessness: breathlessness,
        ContactHistory: contactHistory,
        TravelHistory: travelHistory,
        HIVStatus: hivStatus,
        PreviousTB: previousTB,
        ChestXRay: chestXRay,
        SputumTest: sputumTest,
      };
      const data = await predictRisk(input);
      setResult(data);
    } catch (e: unknown) {
      setError('Submit failed. ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSubmitting(false);
    }
  };

  const goToReport = () => {
    if (result) {
      navigation.navigate('Report', {
        flow: flow || 'medical',
        medical: {
          Age: parseInt(age, 10),
          Gender: gender,
          Cough: parseInt(coughDays, 10),
          Fever: fever,
          WeightLoss: parseFloat(weightLoss) || 0,
          NightSweats: nightSweats,
          ChestPain: chestPain,
          Hemoptysis: hemoptysis,
          Breathlessness: breathlessness,
          ContactHistory: contactHistory,
          TravelHistory: travelHistory,
          HIVStatus: hivStatus,
          PreviousTB: previousTB,
          ChestXRay: chestXRay,
          SputumTest: sputumTest,
        },
        riskResult: result,
      });
    }
  };

  const getLevelColor = (level: string) => {
    const l = (level || '').toUpperCase();
    if (l === 'HIGH') return colors.error;
    if (l === 'MEDIUM') return colors.warning;
    return colors.success;
  };

  const renderToggleButton = (
    label: string,
    options: string[],
    value: string,
    onSelect: (val: any) => void
  ) => (
    <View style={styles.toggleContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.toggleRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.toggleButton,
              value === option && styles.toggleButtonActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.toggleText,
                value === option && styles.toggleTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {!result ? (
          <>
            {/* Basic Info Section */}
            <Text style={styles.sectionHeader}>Basic Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 45"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            
            {renderToggleButton('Gender', ['Male', 'Female'], gender, setGender)}
            
            {/* Symptoms Section */}
            <Text style={styles.sectionHeader}>Symptoms</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Cough (days)</Text>
              <TextInput
                style={styles.input}
                value={coughDays}
                onChangeText={setCoughDays}
                placeholder="e.g. 14"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            
            {renderToggleButton('Fever', ['Yes', 'No'], fever, setFever)}
            
            <View style={styles.field}>
              <Text style={styles.label}>Weight Loss (kg)</Text>
              <TextInput
                style={styles.input}
                value={weightLoss}
                onChangeText={setWeightLoss}
                placeholder="e.g. 5"
                keyboardType="decimal-pad"
                maxLength={5}
              />
            </View>
            
            {renderToggleButton('Night Sweats', ['Yes', 'No'], nightSweats, setNightSweats)}
            {renderToggleButton('Chest Pain', ['Yes', 'No'], chestPain, setChestPain)}
            {renderToggleButton('Hemoptysis (Coughing Blood)', ['Yes', 'No'], hemoptysis, setHemoptysis)}
            {renderToggleButton('Breathlessness', ['Mild', 'Moderate', 'Severe'], breathlessness, setBreathlessness)}
            
            {/* History Section */}
            <Text style={styles.sectionHeader}>Medical History</Text>
            
            {renderToggleButton('TB Contact History', ['Yes', 'No'], contactHistory, setContactHistory)}
            {renderToggleButton('Travel History', ['Yes', 'No'], travelHistory, setTravelHistory)}
            {renderToggleButton('HIV Status', ['Positive', 'Negative'], hivStatus, setHivStatus)}
            {renderToggleButton('Previous TB', ['Yes', 'No'], previousTB, setPreviousTB)}
            
            {/* Test Results Section */}
            <Text style={styles.sectionHeader}>Test Results</Text>
            
            {renderToggleButton('Chest X-Ray', ['Normal', 'Abnormal'], chestXRay, setChestXRay)}
            {renderToggleButton('Sputum Test', ['Positive', 'Negative'], sputumTest, setSputumTest)}
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            {submitting && (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            )}
            
            <PrimaryButton
              title="Submit"
              onPress={submit}
              disabled={submitting}
              style={styles.submitButton}
            />
          </>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Risk Assessment Result</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Risk Level</Text>
              <Text style={[styles.riskLevel, { color: getLevelColor(result.risk_level) }]}>
                {result.risk_level}
              </Text>
            </View>
            
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Risk Score</Text>
              <Text style={styles.riskScore}>{(result.risk_score * 100).toFixed(0)}%</Text>
            </View>
            
            <PrimaryButton
              title="Generate Report"
              onPress={goToReport}
              style={styles.reportButton}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  scroll: {
    padding: 24,
    paddingBottom: 48,
  } as ViewStyle,
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  } as TextStyle,
  field: {
    marginBottom: 20,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  } as ViewStyle,
  label: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  } as TextStyle,
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  } as ViewStyle,
  toggleContainer: {
    marginBottom: 20,
  } as ViewStyle,
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  } as ViewStyle,
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as ViewStyle,
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  } as TextStyle,
  toggleTextActive: {
    color: colors.white,
  } as TextStyle,
  error: {
    color: colors.error,
    marginBottom: 16,
  } as TextStyle,
  loader: {
    marginVertical: 16,
  } as ViewStyle,
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  } as ViewStyle,
  resultContainer: {
    marginTop: 8,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  } as TextStyle,
  resultCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  } as ViewStyle,
  resultLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  } as TextStyle,
  riskLevel: {
    fontSize: 24,
    fontWeight: '700',
  } as TextStyle,
  riskScore: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  } as TextStyle,
  reportButton: {
    marginTop: 24,
  } as ViewStyle,
});
