/**
 * AccessFormScreen — TimeBasedAccess
 * 6-field form → generates a key card → save / share as image.
 */
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Share,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import axios from 'axios';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Colors, Spacing, FontSizes, BorderRadius} from '../theme/colors';

// ── Helpers ──
// Removed HARDCODED mockup values to use dynamic inputs

// The backend server is hard-bound to 192.168.0.157.
// iOS Simulator can route to it directly. Android Emulator cannot, so we use the local proxy.
// The backend server is hard-bound to 192.168.0.157 on port 9898.
// We use the real LAN IP so physical devices on the network can connect.
const API_URL = 'http://192.168.0.157:9898/api/offlinetba/generatePrivateKey';

// ── Custom Wheel Picker ──
const WheelPicker = ({ items, selectedValue, onValueChange }: { items: string[], selectedValue: string, onValueChange: (val: string) => void }) => {
  const ITEM_HEIGHT = 50;
  const lastHapticIndex = useRef(-1);

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM_HEIGHT)));
    
    if (lastHapticIndex.current !== index) {
      lastHapticIndex.current = index;
      if (Platform.OS === 'ios') {
        ReactNativeHapticFeedback.trigger('impactMedium', {
          enableVibrateFallback: false,
          ignoreAndroidSystemSettings: false,
        });
      }
    }
  };

  return (
    <View style={{ height: ITEM_HEIGHT * 3, width: 120, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: ITEM_HEIGHT, height: ITEM_HEIGHT, width: '100%', backgroundColor: 'rgba(0, 230, 118, 0.1)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.primary }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          if (items[index]) onValueChange(items[index]);
        }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
      >
        {items.map((item, index) => (
          <View key={index} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: item === selectedValue ? 24 : 18, color: item === selectedValue ? Colors.primary : Colors.textSecondary, fontWeight: item === selectedValue ? '700' : '500' }}>
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default function AccessFormScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [publicKey, setPublicKey] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [atmIp, setAtmIp] = useState('');
  const [engineerEmail, setEngineerEmail] = useState('');
  
  const [timeLimit, setTimeLimit] = useState('02:30'); // Default 02:30
  const [pickerVisible, setPickerVisible] = useState(false);
  
  const [tempHours, setTempHours] = useState('02');
  const [tempMinutes, setTempMinutes] = useState('30');

  const [privateKey, setPrivateKey] = useState('');
  const [cardGenerated, setCardGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<any>(null);

  const handleGenerate = async () => {
    if (!publicKey.trim() || !timeLimit.trim()) {
      Alert.alert('Required', 'Please enter both public key and time limit.');
      return;
    }
    
    setLoading(true);

    const payload = {
      engineerName: engineerName.trim() || "Admin",
      atmIp: atmIp.trim() || "192.168.1.100",
      engineerEmail: engineerEmail.trim() || "admin@scanplus.com",
      accessTime: timeLimit,
      publicKey: publicKey.trim(),
    };

    console.log('=== AXIOS REQUEST ===');
    console.log('URL:', API_URL);
    console.log('Payload:', JSON.stringify(payload));

    try {
      const response = await axios.post(API_URL, payload, {
        headers: {'Content-Type': 'application/json'},
        timeout: 15000,
      });

      console.log('=== AXIOS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data));

      const finalKey = response.data?.response || JSON.stringify(response.data);

      setPrivateKey(finalKey);
      setCardGenerated(true);
    } catch (error: any) {
      console.log('=== AXIOS ERROR ===');
      console.log('Message:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', JSON.stringify(error.response.data));
      }
      if (error.request) {
        console.log('Request was made but no response received');
      }
      Alert.alert(
        'Network Error',
        `${error.message}\n\nURL: ${API_URL}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const uri = await cardRef.current.capture();
      // Try to save to gallery
      try {
        const {CameraRoll: CR} = require('@react-native-camera-roll/camera-roll');
        await CR.saveAsset(uri);
        Alert.alert('Saved', 'Access key card saved to gallery.');
      } catch {
        // If CameraRoll not available, just notify with the path
        Alert.alert('Saved', 'Access key card saved successfully.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not save the card.');
    }
  };

  const handleShare = async () => {
    try {
      const uri = await cardRef.current.capture();
      await Share.share({
        url: Platform.OS === 'ios' ? uri : `file://${uri}`,
        title: 'ATM Access Key',
        message: 'ATM Access Key — TimeBasedAccess',
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share the card.');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + Spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <View style={styles.backArrow} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Generate Access Key</Text>
        <Text style={styles.pageSubtitle}>
          Enter a public key and time limit to generate an encrypted private ATM access card.
        </Text>

        {/* ── Form Fields ── */}
        {/* Engineer Name Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, {color: Colors.primary}]}>
            Engineer Name *
          </Text>
          <TextInput
            style={[styles.inputContainer, styles.inputEditable]}
            placeholder="e.g. Rahul"
            placeholderTextColor={Colors.textTertiary}
            value={engineerName}
            onChangeText={setEngineerName}
          />
        </View>

        {/* ATM IP Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, {color: Colors.primary}]}>
            ATM IP Address *
          </Text>
          <TextInput
            style={[styles.inputContainer, styles.inputEditable]}
            placeholder="e.g. 192.168.1.100"
            placeholderTextColor={Colors.textTertiary}
            value={atmIp}
            onChangeText={setAtmIp}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Engineer Email Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, {color: Colors.primary}]}>
            Engineer Email *
          </Text>
          <TextInput
            style={[styles.inputContainer, styles.inputEditable]}
            placeholder="e.g. rahul@gmail.com"
            placeholderTextColor={Colors.textTertiary}
            value={engineerEmail}
            onChangeText={setEngineerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Editable Public Key Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, {color: Colors.primary}]}>
            Public Key *
          </Text>
          <TextInput
            style={[styles.inputContainer, styles.inputEditable]}
            placeholder="Enter public key"
            placeholderTextColor={Colors.textTertiary}
            value={publicKey}
            onChangeText={setPublicKey}
            autoCapitalize="characters"
          />
        </View>
        
        {/* Editable Time Limit Field (Picker) */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, {color: Colors.primary}]}>
            Allowance Time Limit *
          </Text>
          <TouchableOpacity
            style={[styles.inputContainer, styles.inputEditable, {justifyContent: 'center'}]}
            activeOpacity={0.7}
            onPress={() => {
              const [h, m] = timeLimit.split(':');
              setTempHours(h || '02');
              setTempMinutes(m || '30');
              setPickerVisible(true);
            }}>
            <Text style={{fontSize: FontSizes.lg, color: Colors.textPrimary, fontWeight: '600'}}>
              {timeLimit ? `${parseInt(timeLimit.split(':')[0])} hours ${parseInt(timeLimit.split(':')[1])} minutes` : 'Select time limit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
        {!cardGenerated && (
          <TouchableOpacity
            style={[styles.generateBtn, loading && {opacity: 0.7}]}
            activeOpacity={0.85}
            onPress={handleGenerate}
            disabled={loading}>
            <Text style={styles.generateBtnText}>
              {loading ? 'Encrypting...' : 'Generate Key Card'}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Generated Key Card ── */}
        {cardGenerated && (
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionTitle}>Access Key Card</Text>

            <ViewShot
              ref={cardRef}
              options={{format: 'png', quality: 1}}
              style={styles.viewShot}>
              <View style={styles.keyCard}>
                {/* Card Header */}
                <View style={styles.keyCardHeader}>
                  <Text style={styles.keyCardBrand}>ScanPlus®</Text>
                  <Text style={styles.keyCardType}>ATM ACCESS KEY</Text>
                </View>

                {/* Card Divider */}
                <View style={styles.keyCardDivider} />

                {/* Card Details */}
                <View style={styles.keyCardBody}>
                  <View style={styles.keyCardRow}>
                    <Text style={styles.keyCardLabel}>Engineer Name</Text>
                    <Text style={styles.keyCardValue}>{engineerName}</Text>
                  </View>
                  <View style={styles.keyCardRow}>
                    <Text style={styles.keyCardLabel}>ATM IP</Text>
                    <Text style={styles.keyCardValue}>{atmIp}</Text>
                  </View>
                  <View style={styles.keyCardRow}>
                    <Text style={styles.keyCardLabel}>Email</Text>
                    <Text style={styles.keyCardValue}>{engineerEmail}</Text>
                  </View>
                  
                  <View style={styles.keyCardRow}>
                    <Text style={styles.keyCardLabel}>Time Limit</Text>
                    <Text style={[styles.keyCardValue, {color: Colors.accent}]}>{timeLimit} Hours</Text>
                  </View>

                  <View style={styles.keyCardDividerThin} />
                  <View style={styles.keyCardKeyRow}>
                    <Text style={styles.keyCardKeyLabel}>ENCRYPTED PRIVATE KEY</Text>
                    <Text 
                      style={styles.keyCardKeyValue} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                    >
                      {privateKey}
                    </Text>
                  </View>
                </View>

                {/* Card Footer */}
                <View style={styles.keyCardFooter}>
                  <View style={styles.keyCardSecureBadge}>
                    <View style={styles.keyCardSecureDot} />
                    <Text style={styles.keyCardSecureText}>
                      Encrypted · TimeBasedAccess
                    </Text>
                  </View>
                </View>
              </View>
            </ViewShot>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                activeOpacity={0.8}
                onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                activeOpacity={0.8}
                onPress={handleShare}>
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{height: Spacing.xxl}} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Time Limit</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginVertical: Spacing.xl}}>
              <View style={{alignItems: 'center'}}>
                <Text style={styles.modalSectionTitle}>Hours</Text>
                <WheelPicker 
                  items={[...Array(25)].map((_, i) => String(i).padStart(2, '0'))}
                  selectedValue={tempHours}
                  onValueChange={setTempHours}
                />
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={styles.modalSectionTitle}>Minutes</Text>
                <WheelPicker 
                  items={[...Array(60)].map((_, i) => String(i).padStart(2, '0'))}
                  selectedValue={tempMinutes}
                  onValueChange={setTempMinutes}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => {
                setTimeLimit(`${tempHours}:${tempMinutes}`);
                setPickerVisible(false);
              }}>
              <Text style={styles.modalConfirmText}>Confirm Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.primary,
    transform: [{rotate: '45deg'}],
    marginRight: Spacing.sm,
  },
  backText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  pageSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  // Form
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  inputContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    height: 52,
    justifyContent: 'center',
  },
  inputDisabled: {
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderColor: Colors.divider,
  },
  disabledText: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  inputEditable: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorderFocused,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 2,
  },

  // Generate Button
  generateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  generateBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Card Section
  cardSection: {
    marginTop: Spacing.xl,
  },
  cardSectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },

  // Key Card (captured for sharing)
  viewShot: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  keyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  keyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surfaceElevated,
  },
  keyCardBrand: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  keyCardType: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  keyCardDivider: {
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  keyCardBody: {
    padding: Spacing.xl,
  },
  keyCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  keyCardLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  keyCardValue: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  keyCardDividerThin: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  keyCardKeyRow: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  keyCardKeyLabel: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  keyCardKeyValue: {
    fontSize: FontSizes.xxl || 32, // Slightly smaller hero size
    color: Colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 2, // Reduced letter spacing to fit 16 chars better
    textAlign: 'center',
  },
  keyCardFooter: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    alignItems: 'center',
  },
  keyCardSecureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyCardSecureDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.secure,
    marginRight: Spacing.sm,
  },
  keyCardSecureText: {
    fontSize: FontSizes.xs,
    color: Colors.secure,
    fontWeight: '500',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  shareBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  shareBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
  },
  modalSectionTitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  pickerScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  pickerItem: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  pickerItemTextSelected: {
    color: Colors.textOnPrimary,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 18,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalConfirmText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
