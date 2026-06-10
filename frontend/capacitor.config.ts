// frontend/capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId:   'com.remindmebuddy.app',
  appName: 'RemindMe Buddy',
  webDir:  'www',

  server: {
    // Remove this block for production builds — only used during live reload
    androidScheme: 'https',
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration:    2000,
      backgroundColor:       '#7C3AED',
      androidSplashResourceName: 'splash',
      showSpinner:           false,
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#7C3AED',
    },
    Keyboard: {
      resize:          'body',
      style:           'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
