/**
 * Device Service — TimeBasedAccess
 * 
 * Handles device identification, registration, and approval status.
 * Uses react-native-device-info for hardware fingerprinting and
 * AsyncStorage for local persistence of approval state.
 * 
 * Currently uses LOCAL MOCK for the backend API.
 * Flip USE_MOCK_API to false when real backend endpoints are ready.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

// ── Configuration ──
const USE_MOCK_API = true; // Set to false when backend is ready
const API_BASE = 'http://45.118.160.135:9898/api';

// ── Storage Keys ──
const STORAGE_KEYS = {
  DEVICE_STATUS: '@device_auth_status',    // 'pending' | 'approved' | 'rejected' | null
  DEVICE_ID: '@device_auth_id',            // cached device ID
  REGISTRATION_DATE: '@device_auth_date',  // ISO timestamp of registration
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

// ── Get Stored Status (Local) ──
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

// ── Register Device ──
export async function registerDevice(info: DeviceInfoData): Promise<RegistrationResponse> {
  if (USE_MOCK_API) {
    // MOCK: Simulate API call, immediately set to pending
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, 'pending');
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, info.deviceId);
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATION_DATE, new Date().toISOString());

    return {
      status: 'pending',
      message: 'Device registered successfully. Awaiting admin approval.',
    };
  }

  // REAL API
  try {
    const response = await fetch(`${API_BASE}/device/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(info),
    });
    const data = await response.json();

    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, data.status || 'pending');
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, info.deviceId);
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATION_DATE, new Date().toISOString());

    return data;
  } catch (error) {
    throw new Error('Failed to register device. Please check your network connection.');
  }
}

// ── Check Device Status (from backend) ──
export async function checkDeviceStatus(deviceId: string): Promise<DeviceStatus> {
  if (USE_MOCK_API) {
    // MOCK: Read from local storage (admin can "approve" by calling mockApproveDevice)
    const status = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_STATUS);
    return (status as DeviceStatus) || 'unregistered';
  }

  // REAL API
  try {
    const response = await fetch(`${API_BASE}/device/status?deviceId=${deviceId}`);
    const data = await response.json();
    const newStatus = data.status as DeviceStatus;

    // Cache the latest status locally
    if (newStatus) {
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, newStatus);
    }

    return newStatus || 'unregistered';
  } catch {
    // If network fails, fall back to cached status
    return getStoredDeviceStatus();
  }
}

// ── Clear Registration (for logout / testing) ──
export async function clearRegistration(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.DEVICE_STATUS,
    STORAGE_KEYS.DEVICE_ID,
    STORAGE_KEYS.REGISTRATION_DATE,
  ]);
}

// ══════════════════════════════════════════════════
// MOCK HELPERS — Remove when real backend is ready
// These let you simulate admin approval/rejection
// from inside the app (e.g. from an admin screen)
// ══════════════════════════════════════════════════

export async function mockApproveDevice(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, 'approved');
}

export async function mockRejectDevice(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_STATUS, 'rejected');
}

export async function mockResetDevice(): Promise<void> {
  await clearRegistration();
}
