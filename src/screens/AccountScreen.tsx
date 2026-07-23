/**
 * AccountScreen — TimeBasedAccess
 * User profile, settings, and logout.
 * Shows "Device Management" option for ADMIN users.
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {getStoredRole, getStoredEmail, getDeviceInfo, checkDeviceStatus} from '../services/deviceService';

// Menu row icons (pure RN)
const ChevronRight = () => (
  <View style={{width: 8, height: 14, justifyContent: 'center'}}>
    <View style={{
      width: 8, height: 8, borderRightWidth: 2, borderBottomWidth: 2,
      borderColor: Colors.textTertiary, transform: [{rotate: '-45deg'}],
    }} />
  </View>
);

// Shield icon for Device Management
const ShieldIcon = () => (
  <View style={{width: 20, height: 22, alignItems: 'center', justifyContent: 'center'}}>
    <View style={{
      width: 18, height: 20, borderWidth: 2, borderColor: Colors.primary,
      borderRadius: 4, borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: Colors.primary,
      }} />
    </View>
  </View>
);

export default function AccountScreen({route}: any) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const onLogout = route.params?.onLogout || (() => {});

  const [userRole, setUserRole] = useState('USER');
  const [userEmail, setUserEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        const email = await getStoredEmail();
        if (isMounted) setUserEmail(email);

        // Check device status & sync latest role from server
        try {
          const info = await getDeviceInfo();
          await checkDeviceStatus(info.deviceId);
        } catch {}

        const role = await getStoredRole();
        console.log('[AccountScreen] Focused. Current user role:', role);
        if (isMounted) setUserRole(role);
      })();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const isAdmin = userRole.toUpperCase() === 'ADMIN';

  const menuItems = [
    {label: 'Personal Information', subtitle: 'Name, email, phone'},
    {label: 'Security Settings', subtitle: 'Password, 2FA, biometrics'},
    {label: 'ATM Permissions', subtitle: 'Manage linked ATMs'},
    {label: 'Notification Preferences', subtitle: 'Alerts & push notifications'},
    {label: 'Help & Support', subtitle: 'FAQs, contact us'},
  ];

  const avatarInitials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'U';

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
            <View style={[styles.avatar, isAdmin && {borderColor: Colors.accent}]}>
              <Text style={[styles.avatarText, isAdmin && {color: Colors.accent}]}>
                {avatarInitials}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {userEmail || 'User'}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                <View style={[
                  styles.roleBadge,
                  {backgroundColor: isAdmin ? 'rgba(255, 184, 0, 0.12)' : 'rgba(0, 180, 255, 0.12)'},
                ]}>
                  <View style={[
                    styles.roleDot,
                    {backgroundColor: isAdmin ? Colors.accent : Colors.primary},
                  ]} />
                  <Text style={[
                    styles.roleText,
                    {color: isAdmin ? Colors.accent : Colors.primary},
                  ]}>
                    {isAdmin ? 'Administrator' : 'User'}
                  </Text>
                </View>
              </View>
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

        {/* ── Admin: Device Management ── */}
        {isAdmin && (
          <>
            <Text style={styles.sectionTitle}>Administration</Text>
            <TouchableOpacity
              style={styles.adminCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('DeviceManagement')}>
              <View style={styles.adminCardLeft}>
                <ShieldIcon />
                <View style={{marginLeft: Spacing.md, flex: 1}}>
                  <Text style={styles.adminCardTitle}>Device Management</Text>
                  <Text style={styles.adminCardSubtitle}>
                    Approve, reject & manage user devices
                  </Text>
                </View>
              </View>
              <ChevronRight />
            </TouchableOpacity>
          </>
        )}

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
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  roleText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
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

  // Admin Card
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 255, 0.25)',
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminCardTitle: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  adminCardSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
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
});
