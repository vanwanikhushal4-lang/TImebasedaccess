/**
 * DevicePendingScreen — TimeBasedAccess
 * 
 * Shown when the device has been registered but is still awaiting
 * admin approval. Features auto-polling and a manual refresh button.
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {getDeviceInfo, checkDeviceStatus} from '../services/deviceService';

const {width} = Dimensions.get('window');

export default function DevicePendingScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 700, useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Continuous pulse animation for the waiting indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Load device ID on mount
  useEffect(() => {
    (async () => {
      const info = await getDeviceInfo();
      setDeviceId(info.deviceId);
    })();
  }, []);

  // Auto-poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleCheckStatus();
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const handleCheckStatus = useCallback(async () => {
    if (!deviceId || checking) return;
    setChecking(true);

    // Spin animation
    Animated.timing(rotateAnim, {
      toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.linear,
    }).start(() => rotateAnim.setValue(0));

    try {
      const status = await checkDeviceStatus(deviceId);
      if (status === 'approved') {
        navigation.replace('Login');
      } else if (status === 'rejected') {
        navigation.replace('DeviceRejected');
      }
      // else still pending — stay on this screen
    } catch {
      // Network error — stay on this screen
    } finally {
      setChecking(false);
    }
  }, [deviceId, checking, navigation, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xl,
            opacity: fadeAnim,
          },
        ]}>

        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Pulsing waiting indicator */}
        <Animated.View style={[styles.waitingRing, {opacity: pulseAnim}]}>
          <View style={styles.waitingRingInner}>
            <View style={styles.clockIcon}>
              <View style={styles.clockHand} />
              <View style={styles.clockHandMinute} />
            </View>
          </View>
        </Animated.View>

        <Text style={styles.title}>Awaiting Approval</Text>
        <Text style={styles.subtitle}>
          Your device registration request has been submitted.{'\n'}
          An administrator will review and approve your device.
        </Text>

        {/* Device ID Display */}
        <View style={styles.deviceIdCard}>
          <Text style={styles.deviceIdLabel}>Your Device ID</Text>
          <Text style={styles.deviceIdValue} selectable>
            {deviceId || '…'}
          </Text>
        </View>

        {/* Status Info */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, {backgroundColor: Colors.accent}]} />
            <Text style={styles.statusText}>Status: Pending Review</Text>
          </View>
          <Text style={styles.statusHint}>
            Auto-checking every 30 seconds
          </Text>
        </View>

        {/* Spacer */}
        <View style={{flex: 1}} />

        {/* Manual Check Button */}
        <TouchableOpacity
          style={styles.checkBtn}
          activeOpacity={0.85}
          onPress={handleCheckStatus}
          disabled={checking}>
          <Animated.View style={{transform: [{rotate: spin}]}}>
            <View style={styles.refreshIcon}>
              <View style={styles.refreshArrow} />
            </View>
          </Animated.View>
          <Text style={styles.checkBtnText}>
            {checking ? 'Checking…' : 'Check Status Now'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Contact your administrator if this takes longer than expected.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgCircle1: {
    position: 'absolute', top: -100, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(255, 184, 0, 0.04)',
  },
  bgCircle2: {
    position: 'absolute', bottom: -60, left: -100,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(0, 180, 255, 0.03)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: 70,
    marginBottom: Spacing.xl,
  },

  // Waiting ring
  waitingRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  waitingRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  clockHand: {
    width: 2,
    height: 10,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  clockHandMinute: {
    width: 7,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    position: 'absolute',
    top: 14,
    right: 5,
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  // Device ID
  deviceIdCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deviceIdLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  deviceIdValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },

  // Status
  statusCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 184, 0, 0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSizes.md,
    color: Colors.accent,
    fontWeight: '600',
  },
  statusHint: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },

  // Check Button
  checkBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: BorderRadius.md,
  },
  checkBtnText: {
    color: Colors.accent,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  refreshIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: Colors.accent,
    borderTopColor: 'transparent',
  },
  refreshArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderBottomColor: Colors.accent,
    position: 'absolute',
    top: -2,
    right: -1,
  },

  footerNote: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
