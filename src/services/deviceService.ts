/**
 * Device Service — TimeBasedAccess
 *
 * Handles device identification, registration, and approval status.
 * Uses react-native-device-info for hardware fingerprinting and
 * AsyncStorage for local persistence of approval state.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

import {API_BASE} from '../config/apiConfig';
export {API_BASE};

// ── Storage Keys ──
const STORAGE_KEYS = {
  DEVICE_STATUS: '@device_auth_status',   // 'pending' | 'approved' | 'rejected'
  DEVICE_ID: '@device_auth_id',           // cached device ID
  REGISTRATION_DATE: '@device_auth_date', // ISO timestamp of registration
  STORED_EMAIL: '@device_auth_email',     // email entered during registration
  USER_ROLE: '@user_role',                // 'ADMIN' | 'USER'
};

// ── Types ──
export type DeviceStatus = 'unregistered' | 'pending' | 'approved' | 'rejected';

export interface DeviceInfoData {
  deviceId: string;
  brand: string;
  model: string;
  deviceName: string;
  osVersion: string;
  platform: 'ios' | 'android';
}

export interface UserRegistrationData extends DeviceInfoData {
  email?: string;
  password?: string;
  contactNo?: string;
  role?: string;
}

export interface RegistrationResponse {
  status: DeviceStatus;
  message: string;
}

// ── Get Device Info ──
export async function getDeviceInfo(): Promise<DeviceInfoData> {
  const [deviceId, brand, model, deviceName, osVersion] = await Promise.all([
    DeviceInfo.getUniqueId(),
    Promise.resolve(DeviceInfo.getBrand()),
    Promise.resolve(DeviceInfo.getModel()),
    DeviceInfo.getDeviceName(),
    Promise.resolve(DeviceInfo.getSystemVersion()),
  ]);

  return {
    deviceId,
    brand,
    model,
    deviceName,
    osVersion,
    platform: Platform.OS as 'ios' | 'android',
  };
}

// ── Get Stored Status (Local Cache) ──
export async function getStoredDeviceStatus(): Promise<DeviceStatus> {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_STATUS);
    if (status === 'pending' || status === 'approved' || status === 'rejected') {
      return status;
    }
    return 'unregistered';
  } catch {
    return 'unregistered';
  }
}

// ── Get Stored Email (for pre-filling login) ──
export async function getStoredEmail(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.STORED_EMAIL)) || '';
  } catch {
    return '';
  }
}

// ── Get / Set User Role ──
export async function getStoredRole(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE)) || 'USER';
  } catch {
    return 'USER';
  }
}

export async function setStoredRole(role: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role.toUpperCase());
}

export async function clearStoredRole(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
}

// ── Decode JWT Token for Role ──
function decodeBase64(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    return '';
  }

  for (
    let block = 0, charCode: number, i = 0;
    (charCode = str.charAt(i++));
    ~charCode && (block = i % 4 ? block * 64 + charCode : charCode)
      ? (output += String.fromCharCode(255 & (block >> ((-2 * i) & 6))))
      : 0
  ) {
    charCode = chars.indexOf(charCode);
  }

  return output;
}

export function parseRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = decodeBase64(base64);
    if (!decoded) return null;
    const parsed = JSON.parse(decoded);
    console.log('[parseRoleFromJwt] Decoded JWT payload:', JSON.stringify(parsed));

    const rawRole =
      parsed.role ||
      parsed.userRole ||
      (Array.isArray(parsed.roles) ? parsed.roles[0] : null) ||
      (Array.isArray(parsed.authorities)
        ? typeof parsed.authorities[0] === 'string'
          ? parsed.authorities[0]
          : parsed.authorities[0]?.authority
        : null);

    if (typeof rawRole === 'string') {
      const clean = rawRole.replace(/^ROLE_/, '').toUpperCase();
      console.log('[parseRoleFromJwt] Extracted role:', clean);
      return clean;
    }
  } catch (e: any) {
    console.log('[parseRoleFromJwt] Exception:', e?.message);
  }
  return null;
}

// ── Fetch Live Role from getAllUsers API ──
export async function fetchUserRoleFromApi(email: string, token: string): Promise<string | null> {
  try {
    console.log('[fetchUserRoleFromApi] Querying /admin/getAllUsers for email:', email);
    const response = await fetch(`${API_BASE}/admin/getAllUsers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    const data = await response.json();

    if (data?.status === 0 && Array.isArray(data.response)) {
      const found = data.response.find(
        (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase(),
      );
      if (found && found.role) {
        console.log('[fetchUserRoleFromApi] Found role in getAllUsers:', found.role);
        return found.role.toUpperCase();
      }
    }
  } catch (e: any) {
    console.log('[fetchUserRoleFromApi] Exception:', e?.message);
  }
  return null;
}

// ── Register Device — POST /api/v1/register/createUser ──
export async function registerDevice(info: UserRegistrationData): Promise<RegistrationResponse> {
  try {
    console.log('[registerDevice] Calling:', `http://192.168.0.157:9898/api/v1/register/createUser`);
    console.log('[registerDevice] Payload:', JSON.stringify({...info, password: '***'}));

    const payload = {...info, role: info.role || 'USER'};
    const response = await fetch(`${API_BASE}/register/createUser`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[registerDevice] HTTP error:', response.status, errorText);
      throw new Error(`Registration failed (${response.status}): ${errorText}`);
    }

    console.log('[registerDevice] HTTP OK, status:', response.status);

    let data: any;
    try {
      data = await response.json();
      console.log('[registerDevice] Response body:', JSON.stringify(data));
    } catch {
      data = null;
    }

    // Backend uses status:0 for success, status:-1 for error (even on HTTP 200)
    if (data && data.status !== undefined && data.status !== 0) {
      const errMsg = typeof data.response === 'string'
        ? data.response
        : data?.response?.message || 'Registration failed on server.';
      console.log('[registerDevice] Server-level error:', errMsg);
      throw new Error(errMsg);
    }

    // Only persist locally if registration actually succeeded
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, 'pending');
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, info.deviceId);
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATION_DATE, new Date().toISOString());
    if (info.email) {
      await AsyncStorage.setItem(STORAGE_KEYS.STORED_EMAIL, info.email);
    }

    console.log('[registerDevice] Saved locally. DeviceId:', info.deviceId);
    return {status: 'pending', message: 'Registered successfully'};
  } catch (error: any) {
    console.log('[registerDevice] Exception:', error.message);
    throw new Error(
      error.message || 'Failed to register device. Please check your network connection.',
    );
  }
}

// ── Clear All Auth Data (wipes local cache completely) ──
export async function clearAllAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DEVICE_STATUS,
      STORAGE_KEYS.DEVICE_ID,
      STORAGE_KEYS.REGISTRATION_DATE,
      STORAGE_KEYS.STORED_EMAIL,
      STORAGE_KEYS.USER_ROLE,
      '@auth_token',
    ]);
    console.log('[clearAllAuthData] All local auth data wiped clean.');
  } catch (e: any) {
    console.log('[clearAllAuthData] Error wiping local auth:', e?.message);
  }
}

// ── Clear Registration (used on logout or re-registration) ──
export async function clearRegistration(): Promise<void> {
  await clearAllAuthData();
}

// ── Check Device Status — GET /api/v1/admin/deviceStatus?deviceId=... ──
export async function checkDeviceStatus(deviceId: string): Promise<DeviceStatus> {
  try {
    console.log('[checkDeviceStatus] Calling deviceId:', deviceId);
    const response = await fetch(`${API_BASE}/admin/deviceStatus?deviceId=${deviceId}`);

    // 404 means device not found on backend — wipe all local auth
    if (response.status === 404) {
      console.log('[checkDeviceStatus] 404 — device not found on backend, wiping local auth data');
      await clearAllAuthData();
      return 'unregistered';
    }

    if (!response.ok) {
      // Other server errors (500) — fall back to cached status
      return getStoredDeviceStatus();
    }

    const data = await response.json();
    console.log('[checkDeviceStatus] Raw backend response:', JSON.stringify(data));

    // Handle status -1 or "Device not found" responses (device deleted from DB)
    const isErrorOrNotFound =
      data?.status === -1 ||
      (typeof data?.response === 'string' && data.response.toLowerCase().includes('not found'));

    if (isErrorOrNotFound) {
      console.log('[checkDeviceStatus] Server returned status -1 / "not found" — device deleted from backend!');
      await clearAllAuthData();
      return 'unregistered';
    }

    // Extract status string from response payload
    let rawStatus: string | null = null;

    if (typeof data?.response === 'string') {
      rawStatus = data.response;
    } else if (typeof data?.response === 'object' && data?.response !== null) {
      rawStatus =
        data.response.deviceStatus ||
        data.response.status ||
        data.response.device_status;
    } else if (typeof data?.deviceStatus === 'string') {
      rawStatus = data.deviceStatus;
    } else if (typeof data?.status === 'string') {
      rawStatus = data.status;
    }

    // Sync role if backend returns role in deviceStatus response
    const serverRole =
      (typeof data?.response === 'object' && data?.response?.role) ||
      data?.role ||
      data?.response?.userRole;

    if (serverRole && typeof serverRole === 'string') {
      console.log('[checkDeviceStatus] Synced role from server:', serverRole);
      await setStoredRole(serverRole);
    }

    if (rawStatus && typeof rawStatus === 'string') {
      const lower = rawStatus.toLowerCase();
      let parsedStatus: DeviceStatus | null = null;

      if (lower.includes('approve')) {
        parsedStatus = 'approved';
      } else if (lower.includes('reject')) {
        parsedStatus = 'rejected';
      } else if (lower.includes('pending')) {
        parsedStatus = 'pending';
      }

      if (parsedStatus) {
        console.log('[checkDeviceStatus] Successfully parsed status:', parsedStatus);
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, parsedStatus);
        return parsedStatus;
      }
    }

    console.log('[checkDeviceStatus] Could not parse status from:', JSON.stringify(data));
    return getStoredDeviceStatus();
  } catch (e: any) {
    console.log('[checkDeviceStatus] Exception:', e.message);
    // Network failure — fall back to cached status
    return getStoredDeviceStatus();
  }
}
