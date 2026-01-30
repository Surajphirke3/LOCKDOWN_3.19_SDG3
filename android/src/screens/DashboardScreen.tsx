import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import CardOption from '../components/CardOption';
import { colors } from '../utils/colors';

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CoughLock</Text>
      <Text style={styles.tagline}>Lock TB early. Act faster.</Text>

      <CardOption
        title="Cough Audio Analysis"
        subtitle="Record cough, get risk label & confidence"
        onPress={() => navigation.navigate('AudioAnalysis', { flow: 'audio' })}
      />

      <CardOption
        title="Medical Risk Prediction"
        subtitle="Enter details for risk score & level"
        onPress={() => navigation.navigate('MedicalPrediction', { flow: 'medical' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    backgroundColor: colors.background,
  } as ViewStyle,
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  tagline: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  } as TextStyle,
});
