/**
 * DeviceRegistrationScreen — TimeBasedAccess
 * 
 * Shown when the device has never been registered.
 * Displays device fingerprint info and a "Request Access" button
 * that sends the device data to the admin for approval.
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {
  getDeviceInfo,
  registerDevice,
  DeviceInfoData,
} from '../services/deviceService';

const {width} = Dimensions.get('window');

// ── Shield Icon (pure RN) ──
const ShieldIcon = () => (
  <View style={{width: 48, height: 56, alignItems: 'center'}}>
    <View style={{
      width: 48, height: 56, borderWidth: 3, borderColor: Colors.primary,
      borderRadius: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{
        width: 16, height: 2, backgroundColor: Colors.primary,
        position: 'absolute',
      }} />
      <View style={{
        width: 2, height: 16, backgroundColor: Colors.primary,
        position: 'absolute',
      }} />
    </View>
  </View>
);

// ── Info Row Component ──
const InfoRow = ({label, value}: {label: string; value: string}) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={infoStyles.value} numberOfLines={1} ellipsizeMode="middle">
      {value}
    </Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
});

export default function DeviceRegistrationScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoData | null>(null);
  
  // Registration Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNo, setContactNo] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    (async () => {
      console.log('=== [DeviceRegistrationScreen] Screen Mounted ===');
      try {
        const info = await getDeviceInfo();
        console.log('[DeviceRegistrationScreen] Device Info loaded successfully:', info);
        setDeviceInfo(info);
      } catch (err: any) {
        console.log('[DeviceRegistrationScreen] Error fetching device info:', err?.message || err);
        Alert.alert('Error', 'Could not read device information.');
      } finally {
        setFetchingInfo(false);
      }
    })();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 700, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRequestAccess = async () => {
    console.log('=== [DeviceRegistrationScreen] User Tapped "Request Access" ===');
    console.log('[DeviceRegistrationScreen] Form Values:', {email, contactNo, passwordLength: password.length, deviceId: deviceInfo?.deviceId});

    if (!deviceInfo) {
      console.log('[DeviceRegistrationScreen] Error: Device Info is missing.');
      return;
    }
    
    if (!email || !password || !contactNo) {
      console.log('[DeviceRegistrationScreen] Validation Error: Missing required fields');
      Alert.alert('Missing Fields', 'Please fill in your email, password, and contact number.');
      return;
    }

    setLoading(true);
    try {
      console.log('[DeviceRegistrationScreen] Sending registration request to backend...');
      const res = await registerDevice({
        ...deviceInfo,
        email,
        password,
        contactNo,
      });
      console.log('[DeviceRegistrationScreen] Registration success response:', res);
      console.log('[DeviceRegistrationScreen] Navigating to DevicePendingScreen');
      navigation.replace('DevicePending');
    } catch (e: any) {
      console.log('[DeviceRegistrationScreen] Registration failed with error:', e?.message || e);
      Alert.alert('Registration Failed', e.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView 
        style={{flex: 1}} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                paddingTop: insets.top + Spacing.xxl,
                paddingBottom: insets.bottom + Spacing.xl,
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>

        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Header */}
        <ShieldIcon />
        <Text style={styles.title}>Device Registration</Text>
        <Text style={styles.subtitle}>
          This device must be registered and approved by an administrator before you can access the system.
        </Text>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="user@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a secure password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.inputLabel}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            placeholderTextColor={Colors.textTertiary}
            value={contactNo}
            onChangeText={setContactNo}
            keyboardType="phone-pad"
          />
        </View>

        {/* Device Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Fingerprint</Text>

          {fetchingInfo ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={{paddingVertical: Spacing.xl}}
            />
          ) : deviceInfo ? (
            <View>
              <InfoRow label="Device ID" value={deviceInfo.deviceId} />
              <InfoRow label="Brand" value={deviceInfo.brand} />
              <InfoRow label="Model" value={deviceInfo.model} />
              <InfoRow label="Device Name" value={deviceInfo.deviceName} />
              <InfoRow label="OS Version" value={`${deviceInfo.platform === 'ios' ? 'iOS' : 'Android'} ${deviceInfo.osVersion}`} />
              <View style={[infoStyles.row, {borderBottomWidth: 0}]}>
                <Text style={infoStyles.label}>Platform</Text>
                <Text style={infoStyles.value}>
                  {deviceInfo.platform === 'ios' ? 'Apple iOS' : 'Android'}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load device info</Text>
          )}
        </View>

        {/* Spacer */}
        <View style={{flex: 1}} />

        {/* Request Access Button */}
        <TouchableOpacity
          style={[styles.requestBtn, (loading || !deviceInfo) && styles.requestBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleRequestAccess}
          disabled={loading || !deviceInfo}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.requestBtnText}>Request Access</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your device fingerprint will be sent to the security administrator for verification.
        </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(0, 180, 255, 0.04)',
  },
  bgCircle2: {
    position: 'absolute', bottom: -60, left: -100,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255, 184, 0, 0.03)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: 70,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },

  formContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    marginBottom: Spacing.lg,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.danger,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },

  requestBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  requestBtnDisabled: {
    opacity: 0.5,
  },
  requestBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 16,
  },
});
