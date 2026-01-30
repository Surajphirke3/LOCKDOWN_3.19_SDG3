import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
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
  const [age, setAge] = useState('');
  const [coughDays, setCoughDays] = useState('');
  const [fever, setFever] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const submit = async () => {
    const ageNum = parseInt(age, 10);
    const coughNum = parseInt(coughDays, 10);
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
        age: ageNum,
        cough_days: coughNum,
        fever,
        smoker,
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
          age: parseInt(age, 10),
          cough_days: parseInt(coughDays, 10),
          fever,
          smoker,
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
            <View style={styles.field}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 35"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Cough (days)</Text>
              <TextInput
                style={styles.input}
                value={coughDays}
                onChangeText={setCoughDays}
                placeholder="e.g. 7"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Fever</Text>
              <Switch
                value={fever}
                onValueChange={setFever}
                trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            
            <View style={styles.row}>
              <Text style={styles.label}>Smoker</Text>
              <Switch
                value={smoker}
                onValueChange={setSmoker}
                trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            
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
  error: {
    color: colors.error,
    marginBottom: 16,
  } as TextStyle,
  loader: {
    marginVertical: 16,
  } as ViewStyle,
  submitButton: {
    marginTop: 16,
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
