/**
 * Dashboard - CoughLock home with two flows: Cough Audio Analysis | Medical Risk Prediction.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CoughLock</Text>
      <Text style={styles.tagline}>Lock TB early. Act faster.</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AudioRecord', { flow: 'audio' })}
        activeOpacity={0.85}
      >
        <Text style={styles.cardTitle}>Cough Audio Analysis</Text>
        <Text style={styles.cardSubtitle}>Record cough, get risk label & confidence</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MedicalForm', { flow: 'medical' })}
        activeOpacity={0.85}
      >
        <Text style={styles.cardTitle}>Medical Risk Prediction</Text>
        <Text style={styles.cardSubtitle}>Enter details for risk score & level</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#f0fdfa',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#134e4a',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#99f6e4',
    minHeight: 100,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
});
