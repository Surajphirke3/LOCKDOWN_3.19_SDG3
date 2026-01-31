/**
 * CoughLock - Lock TB early. Act faster.
 * Entry point: React Navigation stack, Android-first.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import AudioAnalysisScreen from './src/screens/AudioAnalysisScreen';
import MedicalPredictionScreen from './src/screens/MedicalPredictionScreen';
import ReportScreen from './src/screens/ReportScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import VideoAnalysisScreen from './src/screens/VideoAnalysisScreen';
import { colors } from './src/utils/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'CoughLock' }}
          />
          <Stack.Screen
            name="VideoAnalysis"
            component={VideoAnalysisScreen}
            options={{ title: 'Cough Video Analysis' }}
          />
          <Stack.Screen
            name="AudioAnalysis"
            component={AudioAnalysisScreen}
            options={{ title: 'Cough Audio Analysis' }}
          />
          <Stack.Screen
            name="MedicalPrediction"
            component={MedicalPredictionScreen}
            options={{ title: 'Medical Risk Prediction' }}
          />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{ title: 'Final Report', headerLeft: () => null }}
          />
          <Stack.Screen
            name="Assistant"
            component={AssistantScreen}
            options={{ title: 'Health Assistant' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

