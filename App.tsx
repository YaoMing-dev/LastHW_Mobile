// Main App Component with Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/contexts/AppContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <TabNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </AppProvider>
  );
}
