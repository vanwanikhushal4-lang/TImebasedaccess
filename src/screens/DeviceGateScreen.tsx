/**
 * DeviceGateScreen — TimeBasedAccess
 * 
 * Splash/loading screen that checks device registration status on app launch
 * and routes to the appropriate screen:
 *   - unregistered → DeviceRegistration
 *   - pending      → DevicePending
 *   - approved     → Login
 *   - rejected     → DeviceRejected
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import {Colors, Spacing, FontSizes} from '../theme/colors';
import {getStoredDeviceStatus, getDeviceInfo, checkDeviceStatus} from '../services/deviceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function DeviceGateScreen({navigation}: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation on the loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Check device status after a brief delay for the splash to show
    const timer = setTimeout(async () => {
      try {
        console.log('=== [DeviceGateScreen] Starting App Initial Status Check ===');
        const info = await getDeviceInfo();
        console.log('[DeviceGateScreen] Hardware info fetched:', info.deviceId, info.brand, info.model);

        console.log('[DeviceGateScreen] Verifying device status with backend server...');
        const serverStatus = await checkDeviceStatus(info.deviceId);
        console.log('[DeviceGateScreen] Server returned status:', serverStatus);

        const authToken = await AsyncStorage.getItem('@auth_token');

        switch (serverStatus) {
          case 'approved':
            if (authToken) {
              console.log('[DeviceGateScreen] Device APPROVED & Active Session Token Found -> Routing to MainTabs');
              navigation.replace('MainTabs');
            } else {
              console.log('[DeviceGateScreen] Device APPROVED but no Session Token -> Routing to LoginScreen');
              navigation.replace('Login');
            }
            break;
          case 'pending':
            console.log('[DeviceGateScreen] Device PENDING -> Routing to DevicePendingScreen');
            navigation.replace('DevicePending');
            break;
          case 'rejected':
            console.log('[DeviceGateScreen] Device REJECTED -> Routing to DeviceRejectedScreen');
            navigation.replace('DeviceRejected');
            break;
          default:
            console.log('[DeviceGateScreen] Device UNREGISTERED -> Routing to DeviceRegistrationScreen');
            navigation.replace('DeviceRegistration');
        }
      } catch (err: any) {
        console.log('[DeviceGateScreen] Error during gate check:', err?.message || err);
        // If anything fails, fall back to local status
        const fallback = await getStoredDeviceStatus();
        const authToken = await AsyncStorage.getItem('@auth_token');
        console.log('[DeviceGateScreen] Fallback to local stored status:', fallback);
        switch (fallback) {
          case 'approved':
            if (authToken) {
              navigation.replace('MainTabs');
            } else {
              navigation.replace('Login');
            }
            break;
          case 'pending':
            navigation.replace('DevicePending');
            break;
          case 'rejected':
            navigation.replace('DeviceRejected');
            break;
          default:
            navigation.replace('DeviceRegistration');
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, pulseAnim]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>TimeBasedAccess</Text>
        <Text style={styles.subtitle}>ATM SECURITY PORTAL</Text>

        <Animated.View style={[styles.loaderWrap, {transform: [{scale: pulseAnim}]}]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </Animated.View>

        <Text style={styles.statusText}>Verifying device authorization…</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.secureBadge}>
          <View style={styles.secureDot} />
          <Text style={styles.secureText}>Device Authentication</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 180, 255, 0.04)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 230, 118, 0.03)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: width * 0.5,
    height: 90,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.xxl,
  },
  loaderWrap: {
    marginBottom: Spacing.lg,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 180, 255, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 9999,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  secureText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
