/**
 * ResultScreen - Shows risk_score and risk_level from medical submit.
 * CTA to view full report.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { riskResult } = route.params || {};
  const score = riskResult?.risk_score ?? 0;
  const level = riskResult?.risk_level ?? 'UNKNOWN';

  const getLevelColor = () => {
    const l = (level || '').toUpperCase();
    if (l === 'HIGH') return '#b91c1c';
    if (l === 'MEDIUM') return '#d97706';
    return '#059669';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Risk level</Text>
        <Text style={[styles.level, { color: getLevelColor() }]}>{level}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Risk score</Text>
        <Text style={styles.score}>{(score * 100).toFixed(0)}%</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Report', route.params)}
      >
        <Text style={styles.buttonText}>Generate Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0fdfa',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  level: {
    fontSize: 24,
    fontWeight: '700',
  },
  score: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f766e',
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
