/**
 * Mock spectrogram visualization - no real FFT.
 * Renders a simple gradient block for demo.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function SpectrogramPlaceholder({ width = 128, height = 131 }) {
  const cols = Math.min(20, Math.max(5, Math.floor(width / 8)));
  const rows = Math.min(15, Math.max(4, Math.floor(height / 10)));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.grid, { width: cols * 14, height: rows * 14 }]}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={styles.row}>
            {Array.from({ length: cols }).map((_, j) => (
              <View
                key={j}
                style={[
                  styles.cell,
                  {
                    opacity: 0.3 + (0.6 * (i + j)) / (rows + cols),
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 12,
    height: 12,
    margin: 1,
    backgroundColor: '#0f766e',
    borderRadius: 2,
  },
});
