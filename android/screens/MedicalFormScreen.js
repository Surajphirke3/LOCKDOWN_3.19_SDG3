/**
 * MedicalFormScreen - Collects age, cough_days, fever, smoker.
 * Submits to backend and navigates to Result with risk_score, risk_level.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MEDICAL_PREDICT_URL } from '../api';

export default function MedicalFormScreen({ route, navigation }) {
  const { flow } = route.params || {};
  const [age, setAge] = useState('');
  const [coughDays, setCoughDays] = useState('');
  const [fever, setFever] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      const body = {
        age: ageNum,
        cough_days: coughNum,
        fever: fever ? 'true' : 'false',
        smoker: smoker ? 'true' : 'false',
      };
      const res = await fetch(MEDICAL_PREDICT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Submit failed: ' + res.status);
      const data = await res.json();
      navigation.navigate('Result', {
        flow: flow || 'medical',
        medical: { age: ageNum, cough_days: coughNum, fever, smoker },
        riskResult: {
          risk_score: data.risk_score ?? 0,
          risk_level: data.risk_level ?? 'UNKNOWN',
        },
      });
    } catch (e) {
      setError('Submit failed. ' + (e.message || String(e)));
    } finally {
      setSubmitting(false);
    }
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
          <Switch value={fever} onValueChange={setFever} trackColor={{ false: '#cbd5e1', true: '#0f766e' }} thumbColor="#fff" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Smoker</Text>
          <Switch value={smoker} onValueChange={setSmoker} trackColor={{ false: '#cbd5e1', true: '#0f766e' }} thumbColor="#fff" />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {submitting && <ActivityIndicator size="large" color="#0f766e" style={styles.loader} />}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#134e4a',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
