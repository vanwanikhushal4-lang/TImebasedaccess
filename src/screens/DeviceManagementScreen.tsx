/**
 * DeviceManagementScreen — TimeBasedAccess
 * Admin-only screen to view all registered users and approve pending devices.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';
import {API_BASE} from '../services/deviceService';

// ── Types ──
interface UserRecord {
  userId: number;
  email: string;
  contactNo: string;
  deviceId: string;
  brand: string;
  model: string;
  deviceName: string;
  osVersion: string;
  platform: string;
  isInit: boolean;
  deviceStatus: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// ── Status Badge Component ──
const StatusBadge = ({status}: {status: string}) => {
  const normalized = status.toUpperCase();
  let bgColor = 'rgba(148, 163, 184, 0.12)';
  let textColor = Colors.textSecondary;

  if (normalized === 'APPROVED') {
    bgColor = 'rgba(0, 230, 118, 0.12)';
    textColor = Colors.secure;
  } else if (normalized === 'PENDING') {
    bgColor = 'rgba(255, 184, 0, 0.12)';
    textColor = Colors.accent;
  } else if (normalized === 'REJECTED') {
    bgColor = 'rgba(255, 61, 113, 0.12)';
    textColor = Colors.danger;
  }

  return (
    <View style={[badgeStyles.container, {backgroundColor: bgColor}]}>
      <View style={[badgeStyles.dot, {backgroundColor: textColor}]} />
      <Text style={[badgeStyles.text, {color: textColor}]}>{normalized}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// ── Role Badge ──
const RoleBadge = ({role}: {role: string}) => {
  const isAdmin = role.toUpperCase() === 'ADMIN';
  return (
    <View style={[
      roleBadgeStyles.container,
      {backgroundColor: isAdmin ? 'rgba(0, 180, 255, 0.12)' : 'rgba(148, 163, 184, 0.08)'},
    ]}>
      <Text style={[
        roleBadgeStyles.text,
        {color: isAdmin ? Colors.primary : Colors.textTertiary},
      ]}>
        {role.toUpperCase()}
      </Text>
    </View>
  );
};

const roleBadgeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: 8,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

// ── Back Arrow ──
const BackArrow = () => (
  <View style={{width: 10, height: 18, justifyContent: 'center'}}>
    <View style={{
      width: 10, height: 10, borderLeftWidth: 2.5, borderBottomWidth: 2.5,
      borderColor: Colors.primary, transform: [{rotate: '45deg'}],
    }} />
  </View>
);

// ── Vector Apple Icon ──
const AppleIcon = ({size = 20, color = '#FFFFFF', bgColor = 'rgba(255, 255, 255, 0.08)'}: {size?: number; color?: string; bgColor?: string}) => {
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      {/* Leaf */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: size * 0.22,
          width: size * 0.26,
          height: size * 0.26,
          backgroundColor: color,
          borderTopRightRadius: size * 0.26,
          borderBottomLeftRadius: size * 0.26,
          transform: [{rotate: '-30deg'}],
        }}
      />
      {/* Main Apple Body */}
      <View
        style={{
          width: size * 0.74,
          height: size * 0.7,
          backgroundColor: color,
          borderTopLeftRadius: size * 0.37,
          borderTopRightRadius: size * 0.37,
          borderBottomLeftRadius: size * 0.3,
          borderBottomRightRadius: size * 0.3,
          marginTop: size * 0.22,
        }}
      />
      {/* Bite Cutout */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.32,
          right: -size * 0.06,
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size * 0.17,
          backgroundColor: bgColor,
        }}
      />
    </View>
  );
};

// ── Vector Android Icon ──
const AndroidIcon = ({size = 22, color = '#00E676'}: {size?: number; color?: string}) => {
  const headWidth = size * 0.8;
  const headHeight = size * 0.45;
  const eyeSize = size * 0.1;
  const antennaLength = size * 0.22;

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      {/* Left Antenna */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          left: size * 0.22,
          width: 2,
          height: antennaLength,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{rotate: '-28deg'}],
        }}
      />
      {/* Right Antenna */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.08,
          right: size * 0.22,
          width: 2,
          height: antennaLength,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{rotate: '28deg'}],
        }}
      />
      {/* Android Head (Semi-circle) */}
      <View
        style={{
          width: headWidth,
          height: headHeight,
          backgroundColor: color,
          borderTopLeftRadius: headWidth / 2,
          borderTopRightRadius: headWidth / 2,
          marginTop: size * 0.2,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingHorizontal: headWidth * 0.18,
        }}>
        {/* Left Eye */}
        <View style={{width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2, backgroundColor: Colors.surface}} />
        {/* Right Eye */}
        <View style={{width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2, backgroundColor: Colors.surface}} />
      </View>
    </View>
  );
};

// ── Platform Icon ──
const PlatformIcon = ({platform}: {platform: string}) => {
  const isIOS = platform.toLowerCase() === 'ios';
  const bgColor = isIOS ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 230, 118, 0.1)';

  return (
    <View style={{
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: bgColor,
      alignItems: 'center', justifyContent: 'center',
    }}>
      {isIOS ? (
        <AppleIcon size={20} color="#FFFFFF" bgColor={bgColor} />
      ) : (
        <AndroidIcon size={22} color="#00E676" />
      )}
    </View>
  );
};

// ── Main Component ──
export default function DeviceManagementScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert('Session Expired', 'Please log in again.');
        return;
      }

      console.log('[DeviceManagement] Fetching all users...');
      const response = await fetch(`${API_BASE}/admin/getAllUsers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[DeviceManagement] Response status:', response.status);
      const data = await response.json();
      console.log('[DeviceManagement] Users count:', Array.isArray(data?.response) ? data.response.length : 'N/A');

      if (data?.status === 0 && Array.isArray(data.response)) {
        // Sort: PENDING first, then by createdAt descending
        const sorted = [...data.response].sort((a: UserRecord, b: UserRecord) => {
          if (a.deviceStatus === 'PENDING' && b.deviceStatus !== 'PENDING') return -1;
          if (a.deviceStatus !== 'PENDING' && b.deviceStatus === 'PENDING') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setUsers(sorted);
      } else {
        console.log('[DeviceManagement] Unexpected response:', JSON.stringify(data));
      }
    } catch (err: any) {
      console.log('[DeviceManagement] Error fetching users:', err?.message);
      Alert.alert('Error', 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (email: string) => {
    Alert.alert(
      'Approve User',
      `Are you sure you want to approve ${email}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: async () => {
            setApprovingEmail(email);
            try {
              const token = await AsyncStorage.getItem('@auth_token');
              console.log('[DeviceManagement] Approving user:', email);
              const response = await fetch(`${API_BASE}/admin/approveUser/${email}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();
              console.log('[DeviceManagement] Approve response:', JSON.stringify(data));

              if (response.ok || data?.status === 0) {
                Alert.alert('Success', `${email} has been approved.`);
                fetchUsers(); // Refresh list
              } else {
                Alert.alert('Error', data?.response?.message || data?.response || 'Failed to approve user.');
              }
            } catch (err: any) {
              console.log('[DeviceManagement] Approve error:', err?.message);
              Alert.alert('Error', 'Failed to approve user. Please check your connection.');
            } finally {
              setApprovingEmail(null);
            }
          },
        },
      ],
    );
  };

  const pendingCount = users.filter(u => u.deviceStatus.toUpperCase() === 'PENDING').length;
  const approvedCount = users.filter(u => u.deviceStatus.toUpperCase() === 'APPROVED').length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + Spacing.md},
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }>

        {/* ── Header ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <BackArrow />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Device Management</Text>
        <Text style={styles.pageSubtitle}>Manage registered devices & approve pending requests</Text>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={[styles.statCard, {borderColor: 'rgba(255, 184, 0, 0.25)'}]}>
            <Text style={[styles.statNumber, {color: Colors.accent}]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, {borderColor: 'rgba(0, 230, 118, 0.25)'}]}>
            <Text style={[styles.statNumber, {color: Colors.secure}]}>{approvedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* ── Loading State ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No registered users found</Text>
          </View>
        ) : (
          /* ── User List ── */
          users.map((user) => (
            <View key={user.userId} style={styles.userCard}>
              {/* Top Row: Platform icon + Email + Role */}
              <View style={styles.userHeader}>
                <PlatformIcon platform={user.platform} />
                <View style={styles.userHeaderInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                    <RoleBadge role={user.role} />
                  </View>
                  <Text style={styles.userDevice}>{user.brand} {user.model}</Text>
                </View>
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Device ID</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{user.deviceId}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>{user.contactNo}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>OS</Text>
                  <Text style={styles.infoValue}>{user.osVersion}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Registered</Text>
                  <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
                </View>
              </View>

              {/* Footer: Status + Action */}
              <View style={styles.userFooter}>
                <StatusBadge status={user.deviceStatus} />

                {user.deviceStatus.toUpperCase() === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(user.email)}
                    disabled={approvingEmail === user.email}
                    activeOpacity={0.7}>
                    {approvingEmail === user.email ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={styles.approveBtnText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{height: Spacing.xxl}} />
      </ScrollView>
    </View>
  );
}

// ── Styles ──
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
    backgroundColor: 'rgba(0, 230, 118, 0.03)',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },

  // Header
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  pageTitle: {
    fontSize: FontSizes.hero,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    color: Colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    color: Colors.textTertiary,
    fontSize: FontSizes.md,
  },

  // User Card
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userEmail: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  userDevice: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoItem: {
    width: '50%',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // Footer
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  approveBtn: {
    backgroundColor: Colors.secure,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    minWidth: 90,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#000',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});
