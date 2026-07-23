import {Platform} from 'react-native';

/**
 * Central API Configuration
 * Automatically uses 10.0.2.2 on Android Emulator (host alias)
 * and 192.168.0.7 on iOS / Physical devices.
 */
export const SERVER_HOST = '192.168.0.7';
export const SERVER_PORT = '9898';

// Use 10.0.2.2 for Android emulator so host machine localhost is always reachable,
// or SERVER_HOST for iOS / physical devices.
export const HOST_IP = Platform.OS === 'android' ? '10.0.2.2' : SERVER_HOST;

export const API_BASE = `http://${HOST_IP}:${SERVER_PORT}/api/v1`;
export const GENERATE_KEY_URL = `http://${HOST_IP}:${SERVER_PORT}/api/offlinetba/generatePrivateKey`;
