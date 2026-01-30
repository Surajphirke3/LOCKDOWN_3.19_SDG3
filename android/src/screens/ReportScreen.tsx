import React from 'react';
import { View, Text, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../utils/colors';

interface ReportScreenProps {
  route: {
    params?: {
      flow?: string;
      audioResult?: {
        confidence: number;
        label: string;
        spectrogram_shape: number[];
      };
      medical?: {
        age: number;
        cough_days: number;
        fever: boolean;
        smoker: boolean;
      };
      riskResult?: {
        risk_score: number;
        risk_level: string;
      };
    };
  };
  navigation: {
    reset: (config: { index: number; routes: { name: string }[] }) => void;
  };
}

export default function ReportScreen({ route, navigation }: ReportScreenProps) {
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

  const getLevelColor = (level: string) => {
    const l = (level || '').toUpperCase();
    if (l === 'HIGH') return colors.error;
    if (l === 'MEDIUM') return colors.warning;
    return colors.success;
  };

  const goToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Selected Flow</Text>
      <View style={styles.flowCard}>
        <Text style={styles.flowLabel}>
          {isAudio ? 'Cough Audio Analysis' : isMedical ? 'Medical Risk Prediction' : flow || '—'}
        </Text>
      </View>

      {isAudio && audioResult && (
        <>
          <Text style={styles.section}>Audio Analysis</Text>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Risk Label</Text>
            <Text style={styles.rowValue}>{label}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.rowLabel}>Confidence</Text>
            <Text style={styles.rowValue}>{(confidence * 100).toFixed(1)}%</Text>
          </View>
          <Text style={styles.section}>Spectrogram</Text>
          <View style={styles.spectrogramWrap}>
            <SpectrogramGrid shape={shape} />
          </View>
        </>
      )}

      {isMedical && medical && (
        <>
          <Text style={styles.section}>Medical Inputs</Text>
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

      {riskResult && (
        <>
          <Text style={styles.section}>Final Risk</Text>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk Level</Text>
            <Text style={[styles.finalLevel, { color: getLevelColor(riskLevel) }]}>
              {riskLevel}
            </Text>
          </View>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk Score</Text>
            <Text style={styles.finalScore}>{(riskScore * 100).toFixed(0)}%</Text>
          </View>
        </>
      )}

      {isAudio && !riskResult && (
        <>
          <Text style={styles.section}>Final Risk (from Audio)</Text>
          <View style={styles.finalCard}>
            <Text style={styles.rowLabel}>Risk Label</Text>
            <Text style={[styles.finalLevel, { color: colors.primary }]}>{label}</Text>
          </View>
        </>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This is a screening tool, not a medical diagnosis.
        </Text>
      </View>

      <PrimaryButton title="Back to Dashboard" onPress={goToDashboard} />
    </ScrollView>
  );
}

interface SpectrogramGridProps {
  shape: number[];
}

function SpectrogramGrid({ shape }: SpectrogramGridProps) {
  const width = shape[0] || 128;
  const height = shape[1] || 131;
  const cols = Math.min(20, Math.max(5, Math.floor(width / 8)));
  const rows = Math.min(15, Math.max(4, Math.floor(height / 10)));

  return (
    <View style={spectrogramStyles.wrapper}>
      <View style={[spectrogramStyles.grid, { width: cols * 14, height: rows * 14 }]}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={spectrogramStyles.row}>
            {Array.from({ length: cols }).map((_, j) => (
              <View
                key={j}
                style={[
                  spectrogramStyles.cell,
                  { opacity: 0.3 + (0.6 * (i + j)) / (rows + cols) },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const spectrogramStyles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: colors.spectrogramBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  grid: {
    flexDirection: 'column',
  } as ViewStyle,
  row: {
    flexDirection: 'row',
  } as ViewStyle,
  cell: {
    width: 12,
    height: 12,
    margin: 1,
    backgroundColor: colors.primary,
    borderRadius: 2,
  } as ViewStyle,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  content: {
    padding: 24,
    paddingBottom: 48,
  } as ViewStyle,
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 12,
  } as TextStyle,
  flowCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 8,
  } as ViewStyle,
  flowLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  } as TextStyle,
  card: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  } as ViewStyle,
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  } as TextStyle,
  rowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  } as TextStyle,
  spectrogramWrap: {
    marginBottom: 8,
  } as ViewStyle,
  finalCard: {
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  } as ViewStyle,
  finalLevel: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  } as TextStyle,
  finalScore: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  } as TextStyle,
  disclaimer: {
    marginTop: 24,
    marginBottom: 16,
    padding: 14,
    backgroundColor: colors.warningBg,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.warningBorder,
  } as ViewStyle,
  disclaimerText: {
    fontSize: 14,
    color: colors.warningText,
    fontStyle: 'italic',
  } as TextStyle,
});
