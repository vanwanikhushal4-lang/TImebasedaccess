/**
 * LoginScreen — ATM Security App
 * Premium dark login with "Create Account" toggle.
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';

const {width} = Dimensions.get('window');

// ── App Logo ──
const AppLogo = () => (
  <View style={logoStyles.container}>
    <Image
      source={require('../assets/logo.png')}
      style={logoStyles.image}
      resizeMode="contain"
    />
  </View>
);

const logoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  image: {
    width: width * 0.6,
    height: 100,
    zIndex: 1,
  },
});

// ── Lock icon for password field ──
const LockIcon = () => (
  <View style={{width: 18, height: 18, alignItems: 'center', justifyContent: 'center'}}>
    <View style={{
      width: 12, height: 8, borderWidth: 2, borderColor: Colors.textSecondary,
      borderRadius: 6, borderBottomWidth: 0, marginBottom: -1,
    }} />
    <View style={{
      width: 16, height: 11, backgroundColor: Colors.textSecondary,
      borderRadius: 3,
    }} />
  </View>
);

// ── User icon for ID field ──
const UserIcon = () => (
  <View style={{width: 18, height: 18, alignItems: 'center', justifyContent: 'center'}}>
    <View style={{
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: Colors.textSecondary, marginBottom: 1,
    }} />
    <View style={{
      width: 16, height: 7, borderTopLeftRadius: 8, borderTopRightRadius: 8,
      backgroundColor: Colors.textSecondary,
    }} />
  </View>
);

// ── Main Component ──
export default function LoginScreen({navigation}: any) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 800, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.157:9898/api/v1/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: userId, password}),
      });

      const data = await response.json();

      // Backend returns: { "response": { "message": "Login successful", "token": "..." }, "status": 0 }
      // status: 0 means SUCCESS on this backend
      const isSuccess =
        response.ok ||
        data?.status === 0 ||
        data?.response?.message?.toLowerCase().includes('success');

      if (isSuccess) {
        // Optionally store the token for future authenticated requests
        // await AsyncStorage.setItem('@auth_token', data?.response?.token || '');
        navigation.replace('MainTabs');
      } else {
        const message =
          data?.response?.message ||
          data?.message ||
          data?.error ||
          'Invalid email or password.';
        Alert.alert('Access Denied', message);
      }
    } catch {
      Alert.alert('Network Error', 'Could not reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    fieldKey: string,
    secure = false,
  ) => (
    <View
      style={[
        styles.inputContainer,
        focusedField === fieldKey && styles.inputContainerFocused,
      ]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        onFocus={() => setFocusedField(fieldKey)}
        onBlur={() => setFocusedField(null)}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Background accents */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <Animated.View style={[
            styles.header,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
            <AppLogo />
          </Animated.View>

          <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
            <Text style={styles.appTitle}>TimeBasedAccess</Text>
            <Text style={styles.appSubtitle}>Offline ATM Security Portal</Text>
          </Animated.View>

          {/* ── Card ── */}
          <Animated.View style={[
            styles.card,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
            {/* ── Form Fields ── */}
            <View style={styles.form}>
              {renderInput(
                <UserIcon />, 'Email Address', userId, setUserId, 'userId',
              )}
              {renderInput(
                <LockIcon />, 'Password', password, setPassword, 'password', true,
              )}

              {/* Forgot password */}
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Primary CTA */}
              <TouchableOpacity 
                style={[styles.primaryBtn, loading && {opacity: 0.7}]} 
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}>
                <View style={styles.primaryBtnInner}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Sign In Securely
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.secureBadge}>
              <View style={styles.secureDot} />
              <Text style={styles.secureText}>256-bit AES Encrypted</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Small inline styles for icons
const iconCircle = {
  width: 18, height: 18, alignItems: 'center' as const, justifyContent: 'center' as const,
};
const iconText = {
  color: Colors.textSecondary, fontSize: 15, fontWeight: '600' as const, marginTop: -1,
};

// ── Stylesheet ──
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {flex: 1},

  // Background decorations
  bgCircle1: {
    position: 'absolute', top: -80, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(0, 180, 255, 0.04)',
  },
  bgCircle2: {
    position: 'absolute', bottom: -40, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255, 184, 0, 0.03)',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.xl,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Form
  form: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    height: 60,
  },
  inputContainerFocused: {
    borderColor: Colors.inputBorderFocused,
    backgroundColor: 'rgba(0, 180, 255, 0.04)',
  },
  inputIcon: {
    marginRight: Spacing.sm + 4,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    height: '100%',
  },

  // Forgot
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Primary Button
  primaryBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  primaryBtnInner: {
    backgroundColor: Colors.primary,
    paddingVertical: 22,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  primaryBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Switch mode
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  switchText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  switchLink: {
    fontSize: FontSizes.sm,
    color: Colors.accent,
    fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  secureDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.secure,
    marginRight: Spacing.sm,
  },
  secureText: {
    fontSize: FontSizes.xs,
    color: Colors.secure,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
});
