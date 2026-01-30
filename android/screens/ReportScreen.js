/**
 * Final Report - Summarizes selected flow (Audio / Medical), results, disclaimer.
 * "Go Back to Dashboard" resets navigation to Home.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import SpectrogramPlaceholder from '../components/SpectrogramPlaceholder';

export default function ReportScreen({ route, navigation }) {
  const { flow, audioResult, medical, riskResult } = route.params || {};
  const isAudio = flow === 'audio';
  const isMedical = flow === 'medical';

  const confidence = audioResult?.confidence ?? 0;
  const label = audioResult?.label ?? '—';
  const shape = audioResult?.spectrogram_shape ?? [128, 131];
  const riskScore = riskResult?.risk_score ?? 0;
  const riskLevel = riskResult?.risk_level ?? '—';
  const age = medical?.age ?? '—';
  const coughDays = medical?.cough_days ?? '—';
  const fever = medical?.fever ?? false;
  const smoker = medical?.smoker ?? false;

  const getLevelColor = () => {
    const l = (riskLevel || '').toUpperCase();
    if (l === 'HIGH') return '#b91c1c';
    if (l === 'MEDIUM') return '#d97706';
    return '#059669';
  };

  const goToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Selected flow</Text>
      <View style={styles.flowCard}>
        <Text style={styles.flowLabel}>
          {isAudio ? 'Cough Audio Analysis' : isMedical ? 'Medical Risk Prediction' : flow || '—'}
        </Text>
      </View>

      {isAudio && audioResult && (
        <>
          <Text style={styles.section}>Audio analysis</Text>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Risk label</Text>
            <Text style={styles.rowValue}>{label}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Confidence</Text>
            <Text style={styles.rowValue}>{(confidence * 100).toFixed(1)}%</Text>
          </View>
          <Text style={styles.section}>Spectrogram</Text>
          <View style={styles.spectrogramWrap}>
            <SpectrogramPlaceholder width={shape[0]} height={shape[1]} />
          </View>
        </>
      )}

      {isMedical && medical && (
        <>
          <Text style={styles.section}>Medical inputs</Text>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Age</Text>
            <Text style={styles.rowValue}>{age}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Cough (days)</Text>
            <Text style={styles.rowValue}>{coughDays}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Fever</Text>
            <Text style={styles.rowValue}>{fever ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Smoker</Text>
            <Text style={styles.rowValue}>{smoker ? 'Yes' : 'No'}</Text>
          </View>
        </>
      )}

      {(riskResult?.risk_score != null || riskResult?.risk_level) && (
        <>
          <Text style={styles.section}>Final risk</Text>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk level</Text>
            <Text style={[styles.finalLevel, { color: getLevelColor() }]}>{riskLevel}</Text>
          </View>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk score</Text>
            <Text style={styles.finalScore}>{(riskScore * 100).toFixed(0)}%</Text>
          </View>
        </>
      )}

      {isAudio && !riskResult && (
        <>
          <Text style={styles.section}>Final risk (from audio)</Text>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk label</Text>
            <Text style={[styles.finalLevel, { color: '#0f766e' }]}>{label}</Text>
          </View>
        </>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This is a screening tool, not a medical diagnosis.
        </Text>
      </View>

      <TouchableOpacity style={styles.dashboardButton} onPress={goToDashboard}>
        <Text style={styles.dashboardButtonText}>Go Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginTop: 20,
    marginBottom: 12,
  },
  flowCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f766e',
    marginBottom: 8,
  },
  flowLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#134e4a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  rowLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134e4a',
  },
  spectrogramWrap: {
    marginBottom: 8,
  },
  finalCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  finalLevel: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  finalScore: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f766e',
    marginTop: 4,
  },
  disclaimer: {
    marginTop: 24,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400e',
    fontStyle: 'italic',
  },
  dashboardButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
