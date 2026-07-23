import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

/**
 * Central API Configuration
 * 
 * - Android Emulator -> uses 10.0.2.2 (special host loopback alias)
 * - Physical Android, Physical iPhone, & iOS Simulator -> uses Mac Wi-Fi LAN IP (192.168.0.7)
 */
export const SERVER_HOST = '192.168.0.157';
export const SERVER_PORT = '9898';

const isEmulator = DeviceInfo.isEmulatorSync();

export const HOST_IP = (Platform.OS === 'android' && isEmulator) ? '10.0.2.2' : SERVER_HOST;

export const API_BASE = `http://${HOST_IP}:${SERVER_PORT}/api/v1`;
export const GENERATE_KEY_URL = `http://${HOST_IP}:${SERVER_PORT}/api/offlinetba/generatePrivateKey`;

console.log('[apiConfig] Environment Detected:', {
  platform: Platform.OS,
  isEmulator,
  selectedHostIP: HOST_IP,
  API_BASE,
});
