/**
 * TimeBasedAccess — ATM Security App
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DeviceGateScreen from './src/screens/DeviceGateScreen';
import DeviceRegistrationScreen from './src/screens/DeviceRegistrationScreen';
import DevicePendingScreen from './src/screens/DevicePendingScreen';
import DeviceRejectedScreen from './src/screens/DeviceRejectedScreen';
import LoginScreen from './src/screens/LoginScreen';
import AccessFormScreen from './src/screens/AccessFormScreen';
import DeviceManagementScreen from './src/screens/DeviceManagementScreen';
import AppNavigator from './src/AppNavigator';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#06090F" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {/* Device Authentication Gate */}
          <Stack.Screen name="DeviceGate" component={DeviceGateScreen} />
          <Stack.Screen name="DeviceRegistration" component={DeviceRegistrationScreen} />
          <Stack.Screen name="DevicePending" component={DevicePendingScreen} />
          <Stack.Screen name="DeviceRejected" component={DeviceRejectedScreen} />

          {/* Main App Flow */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={AppNavigator} />
          <Stack.Screen name="AccessForm" component={AccessFormScreen} />
          <Stack.Screen name="DeviceManagement" component={DeviceManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
