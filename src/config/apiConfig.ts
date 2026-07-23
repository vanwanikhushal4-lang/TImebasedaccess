import {Platform} from 'react-native';

/**
 * Central API Configuration
 * All devices (Android Emulator, Physical Android, Physical iPhone, iOS Simulator)
 * connect directly to the backend host at 192.168.0.157:9898.
 */
export const SERVER_HOST = '192.168.0.157';
export const SERVER_PORT = '9898';

export const HOST_IP = SERVER_HOST;

export const API_BASE = `http://${HOST_IP}:${SERVER_PORT}/api/v1`;
export const GENERATE_KEY_URL = `http://${HOST_IP}:${SERVER_PORT}/api/offlinetba/generatePrivateKey`;

console.log('[apiConfig] Target API Base:', API_BASE);
