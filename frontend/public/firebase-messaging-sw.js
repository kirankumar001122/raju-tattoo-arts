// Firebase Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Public Firebase config for Service Worker
firebase.initializeApp({
  apiKey: 'AIzaSyDemoPlaceholderKeyForRajuTattooArts',
  authDomain: 'raju-tattoo-arts.firebaseapp.com',
  projectId: 'raju-tattoo-arts',
  storageBucket: 'raju-tattoo-arts.appspot.com',
  messagingSenderId: '100000000000',
  appId: '1:100000000000:web:abcdef1234567890'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification ? payload.notification.title : 'Raju Tattoo Arts';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'You have an appointment update.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification.data);
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.click_action)
    ? event.notification.data.click_action
    : '/my-bookings';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
