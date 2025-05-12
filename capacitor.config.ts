import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.centralisation.cours',
  appName: 'Centralisation des Cours',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      '*',
      'https://9be0-193-51-24-154.ngrok-free.app/*',
      'http://10.0.2.2:5000/*',
      'http://localhost:5000/*'
    ]
  },
  // Add these logs to help debug connectivity issues
  loggingBehavior: 'debug',
  android: {
    allowMixedContent: true
  }
};

export default config;
