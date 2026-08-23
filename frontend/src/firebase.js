import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Public Firebase Client Config (read from environment variables with safe defaults)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForRajuTattooArts',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'raju-tattoo-arts.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'raju-tattoo-arts',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'raju-tattoo-arts.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '100000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:100000000000:web:abcdef1234567890'
};

const app = initializeApp(firebaseConfig);

let messaging = null;
if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('Firebase Messaging initialization skipped or unsupported in this browser:', err.message);
  }
}

export { app, messaging };

export const requestNotificationPermissionAndGetToken = async () => {
  if (!messaging || !('Notification' in window)) {
    console.log('Browser notifications are not supported in this environment.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      let swRegistration;
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
      const token = await getToken(messaging, {
        vapidKey: vapidKey || undefined,
        serviceWorkerRegistration: swRegistration
      });

      if (token) {
        console.log('FCM Token generated successfully:', token.substring(0, 15) + '...');
        return token;
      } else {
        console.warn('No FCM registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission state:', permission);
      return null;
    }
  } catch (err) {
    console.error('Error requesting notification permission or fetching FCM token:', err);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  if (messaging) {
    return onMessage(messaging, (payload) => {
      console.log('Foreground FCM notification received:', payload);
      callback(payload);
    });
  }
  return () => {};
};
