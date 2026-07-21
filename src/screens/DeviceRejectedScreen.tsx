/**
 * DeviceRejectedScreen — TimeBasedAccess
 * 
 * Shown when the admin has explicitly rejected this device.
 * Offers a "Re-request Access" option.
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {
  getDeviceInfo,
  registerDevice,
  clearRegistration,
} from '../services/deviceService';

const {width} = Dimensions.get('window');

export default function DeviceRejectedScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 700, useNativeDriver: true,
    }).start();

    // Shake the denied icon once on mount
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 80, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 80, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 8, duration: 70, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -8, duration: 70, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 60, useNativeDriver: true}),
    ]).start();

    (async () => {
      const info = await getDeviceInfo();
      setDeviceId(info.deviceId);
    })();
  }, [fadeAnim, shakeAnim]);

  const handleReRequest = async () => {
    Alert.alert(
      'Re-request Access',
      'This will submit a new access request for your device. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);
            try {
              await clearRegistration();
              const info = await getDeviceInfo();
              await registerDevice(info);
              navigation.replace('DevicePending');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to re-request access.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

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

        {/* Denied Icon */}
        <Animated.View style={[styles.deniedRing, {transform: [{translateX: shakeAnim}]}]}>
          <View style={styles.deniedInner}>
            <View style={styles.xLine1} />
            <View style={styles.xLine2} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.subtitle}>
          Your device has been rejected by the administrator.{'\n'}
          You are not authorized to access this system.
        </Text>

        {/* Device ID */}
        <View style={styles.deviceIdCard}>
          <Text style={styles.deviceIdLabel}>Rejected Device</Text>
          <Text style={styles.deviceIdValue} selectable>
            {deviceId || '…'}
          </Text>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Why was my device rejected?</Text>
          <Text style={styles.warningText}>
            • Your device may not be on the authorized list{'\n'}
            • Contact your security administrator for details{'\n'}
            • You may submit a new request below
          </Text>
        </View>

        {/* Spacer */}
        <View style={{flex: 1}} />

        {/* Re-request Button */}
        <TouchableOpacity
          style={styles.reRequestBtn}
          activeOpacity={0.85}
          onPress={handleReRequest}
          disabled={loading}>
          <Text style={styles.reRequestBtnText}>
            {loading ? 'Submitting…' : 'Re-request Access'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          A new request will be sent to the administrator for review.
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
    backgroundColor: 'rgba(255, 61, 113, 0.04)',
  },
  bgCircle2: {
    position: 'absolute', bottom: -60, left: -100,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255, 61, 113, 0.03)',
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

  // Denied Icon
  deniedRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  deniedInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 61, 113, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: 30,
    height: 3,
    backgroundColor: Colors.danger,
    borderRadius: 2,
    transform: [{rotate: '45deg'}],
  },
  xLine2: {
    position: 'absolute',
    width: 30,
    height: 3,
    backgroundColor: Colors.danger,
    borderRadius: 2,
    transform: [{rotate: '-45deg'}],
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.danger,
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
    borderColor: 'rgba(255, 61, 113, 0.2)',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deviceIdLabel: {
    fontSize: FontSizes.xs,
    color: Colors.danger,
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
  },

  // Warning
  warningBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 61, 113, 0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 113, 0.12)',
  },
  warningTitle: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  warningText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Re-request button
  reRequestBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.danger,
    paddingVertical: 18,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reRequestBtnText: {
    color: Colors.danger,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },

  footerNote: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
