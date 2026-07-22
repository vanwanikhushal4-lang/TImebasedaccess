/**
 * AccountScreen — TimeBasedAccess
 * User profile, settings, and logout.
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {
  getDeviceInfo,
  getStoredDeviceStatus,
  mockApproveDevice,
  mockRejectDevice,
  mockResetDevice,
  DeviceInfoData,
  DeviceStatus,
} from '../services/deviceService';

// Menu row icons (pure RN)
const ChevronRight = () => (
  <View style={{width: 8, height: 14, justifyContent: 'center'}}>
    <View style={{
      width: 8, height: 8, borderRightWidth: 2, borderBottomWidth: 2,
      borderColor: Colors.textTertiary, transform: [{rotate: '-45deg'}],
    }} />
  </View>
);

export default function AccountScreen({route}: any) {
  const insets = useSafeAreaInsets();
  const onLogout = route.params?.onLogout || (() => {});
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoData | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>('unregistered');

  useEffect(() => {
    (async () => {
      const info = await getDeviceInfo();
      setDeviceInfo(info);
      const status = await getStoredDeviceStatus();
      setDeviceStatus(status);
    })();
  }, []);

  const menuItems = [
    {label: 'Personal Information', subtitle: 'Name, email, phone'},
    {label: 'Security Settings', subtitle: 'Password, 2FA, biometrics'},
    {label: 'ATM Permissions', subtitle: 'Manage linked ATMs'},
    {label: 'Notification Preferences', subtitle: 'Alerts & push notifications'},
    {label: 'Help & Support', subtitle: 'FAQs, contact us'},
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + Spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Text style={styles.pageTitle}>Account</Text>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>POC</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>poc</Text>
              <Text style={styles.profileRole}>Security Admin</Text>
            </View>
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatNumber}>-</Text>
              <Text style={styles.profileStatLabel}>ATMs</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatNumber}>-</Text>
              <Text style={styles.profileStatLabel}>Sessions</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatNumber}>-</Text>
              <Text style={styles.profileStatLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* ── Settings Menu ── */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && {borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0},
              ]}
              activeOpacity={0.6}>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Device Admin Controls (Mock) ── */}
        <Text style={styles.sectionTitle}>Device Auth (Admin Mock)</Text>
        <View style={styles.menuCard}>
          <View style={[infoStyles.row, {borderBottomWidth: 0}]}>
            <Text style={infoStyles.label}>Device ID</Text>
            <Text style={infoStyles.value} numberOfLines={1}>{deviceInfo?.deviceId || '…'}</Text>
          </View>
          <View style={[infoStyles.row, {borderBottomWidth: 0}]}>
            <Text style={infoStyles.label}>Status</Text>
            <Text style={[infoStyles.value, {
              color: deviceStatus === 'approved' ? Colors.secure 
                   : deviceStatus === 'rejected' ? Colors.danger 
                   : Colors.accent
            }]}>
              {deviceStatus.toUpperCase()}
            </Text>
          </View>
          <View style={{flexDirection: 'row', gap: 8, marginTop: Spacing.md}}>
            <TouchableOpacity 
              style={[styles.mockBtn, {backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: Colors.secure}]}
              onPress={async () => {
                await mockApproveDevice();
                setDeviceStatus('approved');
                Alert.alert('Done', 'Device status set to APPROVED');
              }}>
              <Text style={[styles.mockBtnText, {color: Colors.secure}]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mockBtn, {backgroundColor: 'rgba(255, 61, 113, 0.15)', borderColor: Colors.danger}]}
              onPress={async () => {
                await mockRejectDevice();
                setDeviceStatus('rejected');
                Alert.alert('Done', 'Device status set to REJECTED');
              }}>
              <Text style={[styles.mockBtnText, {color: Colors.danger}]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mockBtn, {backgroundColor: 'rgba(255, 184, 0, 0.15)', borderColor: Colors.accent}]}
              onPress={async () => {
                await mockResetDevice();
                setDeviceStatus('unregistered');
                Alert.alert('Done', 'Device registration cleared. Restart app to test.');
              }}>
              <Text style={[styles.mockBtnText, {color: Colors.accent}]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* ── App Info ── */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>TimeBasedAccess v1.0.0</Text>
          <Text style={styles.appInfoText}>ScanPlus® ATM Security</Text>
        </View>

        <View style={{height: Spacing.xl}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  // Header
  pageTitle: {
    fontSize: FontSizes.hero,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.xl,
  },

  // Profile Card
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 180, 255, 0.1)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  profileDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  profileStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatNumber: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  profileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.divider,
  },

  // Section Title
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },

  // Menu
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  menuItemLabel: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Logout
  logoutBtn: {
    backgroundColor: 'rgba(255, 61, 113, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 113, 0.25)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },

  // Mock Admin Buttons
  mockBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  mockBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});

// Inline styles for device info rows
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
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
