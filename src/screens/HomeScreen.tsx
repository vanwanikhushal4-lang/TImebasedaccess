/**
 * HomeScreen — TimeBasedAccess
 * Premium single-action screen — Give Access.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* ── Top Header ── */}
      <View style={[styles.header, {paddingTop: insets.top + Spacing.lg}]}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>Admin</Text>
        </View>
        <Image
          source={require('../assets/logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* ── Status Pill ── */}
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>System Secure</Text>
      </View>

      {/* ── Center Content ── */}
      <View style={styles.centerContent}>
        <View style={styles.accessRingOuter}>
          <View style={styles.accessRingMiddle}>
            <TouchableOpacity style={styles.accessBtn} activeOpacity={0.8} onPress={() => navigation.navigate('AccessForm')}>
              <Text style={styles.accessBtnText}>Give Access</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.tapHint}>Tap to grant ATM access</Text>
      </View>

      {/* ── Footer ── */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + Spacing.lg}]}>
        <View style={styles.encryptedBadge}>
          <View style={styles.encryptedDot} />
          <Text style={styles.encryptedText}>256-bit AES Encrypted</Text>
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

  // Background
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  headerLogo: {
    width: 110,
    height: 44,
  },

  // Status
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secure,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.secure,
    fontWeight: '600',
  },

  // Center
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessRingOuter: {
    width: 300,
    height: 140,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessRingMiddle: {
    width: 270,
    height: 110,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessBtn: {
    width: 240,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  accessBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tapHint: {
    marginTop: Spacing.xl,
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  encryptedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.secure,
    marginRight: Spacing.sm,
  },
  encryptedText: {
    fontSize: FontSizes.xs,
    color: Colors.secure,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
