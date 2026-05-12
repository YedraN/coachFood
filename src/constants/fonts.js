import { Platform } from 'react-native';

export const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });
