import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import * as Location from 'expo-location';
import PrimaryButton from '../components/PrimaryButton';
import { queryAssistant, AssistantResponse, Hospital } from '../services/assistantService';
import { colors } from '../utils/colors';

interface AssistantScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
    goBack: () => void;
  };
  route?: {
    params?: {
      riskLevel?: string;
    };
  };
}

export default function AssistantScreen({ navigation, route }: AssistantScreenProps) {
  const [riskLevel, setRiskLevel] = useState(route?.params?.riskLevel || 'MEDIUM');
  const [userLocation, setUserLocation] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get user's current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby hospitals.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const locationString = [
          address.city,
          address.region,
          address.country,
        ].filter(Boolean).join(', ');
        setUserLocation(locationString || 'Unknown location');
      }
    } catch (e) {
      console.error('Location error:', e);
      setUserLocation('Mumbai, Maharashtra'); // Default fallback
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSubmit = async () => {
    if (!userQuery.trim()) {
      Alert.alert('Error', 'Please enter your question.');
      return;
    }
    if (!userLocation.trim()) {
      Alert.alert('Error', 'Please enter your location or enable location services.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await queryAssistant({
        risk_level: riskLevel,
        user_location: userLocation,
        user_query: userQuery,
      });
      setResponse(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    'What should I do now?',
    'Where is the nearest hospital?',
    'What are the symptoms of TB?',
    'How can I get tested?',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏥 Health Assistant</Text>
      <Text style={styles.subtitle}>
        Ask questions about your health and find nearby hospitals
      </Text>

      {/* Risk Level Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Risk Level</Text>
        <View style={styles.riskButtons}>
          {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
            <PrimaryButton
              key={level}
              title={level}
              onPress={() => setRiskLevel(level)}
              variant={riskLevel === level ? 'primary' : 'secondary'}
              style={styles.riskButton}
            />
          ))}
        </View>
      </View>

      {/* Location Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Your Location</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={styles.input}
            value={userLocation}
            onChangeText={setUserLocation}
            placeholder="e.g., Mumbai, Maharashtra"
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton
            title={locationLoading ? '...' : '📍'}
            onPress={getCurrentLocation}
            disabled={locationLoading}
            style={styles.locationButton}
          />
        </View>
      </View>

      {/* Query Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Your Question</Text>
        <TextInput
          style={[styles.input, styles.queryInput]}
          value={userQuery}
          onChangeText={setUserQuery}
          placeholder="What would you like to know?"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Suggested Queries */}
      <View style={styles.section}>
        <Text style={styles.suggestedLabel}>Suggested questions:</Text>
        <View style={styles.suggestedQueries}>
          {suggestedQueries.map((query, index) => (
            <PrimaryButton
              key={index}
              title={query}
              onPress={() => setUserQuery(query)}
              variant="secondary"
              style={styles.suggestedButton}
            />
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <PrimaryButton
        title={loading ? 'Getting Response...' : 'Ask Assistant'}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.submitButton}
      />

      {loading && (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Response Display */}
      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>💬 Assistant Response</Text>
          
          {response.response && (
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>{response.response}</Text>
            </View>
          )}

          {response.recommendations && response.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Recommendations</Text>
              {response.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {rec}</Text>
                </View>
              ))}
            </View>
          )}

          {response.hospitals && response.hospitals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏥 Nearby Hospitals</Text>
              {response.hospitals.map((hospital, index) => (
                <View key={index} style={styles.hospitalCard}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  {hospital.address && (
                    <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                  )}
                  {hospital.distance && (
                    <Text style={styles.hospitalDistance}>📍 {hospital.distance}</Text>
                  )}
                  {hospital.phone && (
                    <Text style={styles.hospitalPhone}>📞 {hospital.phone}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Back to Dashboard */}
      <PrimaryButton
        title="← Back to Dashboard"
        onPress={() => navigation.goBack()}
        variant="secondary"
        style={styles.backButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  content: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,
  section: {
    marginBottom: 20,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  } as TextStyle,
  riskButtons: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  riskButton: {
    flex: 1,
    paddingVertical: 10,
  } as ViewStyle,
  riskLOW: {
    backgroundColor: colors.success,
  } as ViewStyle,
  riskMEDIUM: {
    backgroundColor: colors.warning,
  } as ViewStyle,
  riskHIGH: {
    backgroundColor: colors.error,
  } as ViewStyle,
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  } as TextStyle,
  locationButton: {
    paddingHorizontal: 16,
  } as ViewStyle,
  queryInput: {
    height: 100,
    textAlignVertical: 'top',
  } as TextStyle,
  suggestedLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  } as TextStyle,
  suggestedQueries: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,
  suggestedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  } as ViewStyle,
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  } as ViewStyle,
  loader: {
    marginVertical: 16,
  } as ViewStyle,
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  } as ViewStyle,
  errorText: {
    color: colors.error,
    fontSize: 14,
  } as TextStyle,
  responseContainer: {
    marginTop: 16,
  } as ViewStyle,
  responseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  } as TextStyle,
  responseCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  } as ViewStyle,
  responseText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  } as TextStyle,
  recommendationItem: {
    marginBottom: 8,
  } as ViewStyle,
  recommendationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
  hospitalCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  } as ViewStyle,
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  } as TextStyle,
  hospitalAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  hospitalDistance: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 2,
  } as TextStyle,
  hospitalPhone: {
    fontSize: 13,
    color: colors.primary,
  } as TextStyle,
  backButton: {
    marginTop: 24,
  } as ViewStyle,
});
