/**
 * SpectrogramScreen - Displays confidence, risk label, spectrogram placeholder.
 * Flow 1 ends here: "Generate Report" → Report screen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SpectrogramPlaceholder from '../components/SpectrogramPlaceholder';

export default function SpectrogramScreen({ route, navigation }) {
  const { audioResult, flow } = route.params || {};
  const confidence = audioResult?.confidence ?? 0;
  const label = audioResult?.label ?? 'Unknown';
  const shape = audioResult?.spectrogram_shape ?? [128, 131];

  const goToReport = () => {
    navigation.navigate('Report', {
      flow: flow || 'audio',
      audioResult,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Risk label</Text>
        <Text style={styles.value}>{label}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Confidence</Text>
        <Text style={styles.value}>{(confidence * 100).toFixed(1)}%</Text>
      </View>
      <Text style={styles.sectionTitle}>Spectrogram</Text>
      <SpectrogramPlaceholder width={shape[0]} height={shape[1]} />
      <TouchableOpacity style={styles.button} onPress={goToReport}>
        <Text style={styles.buttonText}>Generate Report</Text>
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f766e',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#134e4a',
    marginTop: 16,
    marginBottom: 8,
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
