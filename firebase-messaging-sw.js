/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// A fetch handler also makes the worker eligible for installability checks.
self.addEventListener('fetch', () => {});

const parameters = new URL(self.location.href).searchParams;
const firebaseConfig = {
  apiKey: parameters.get('apiKey') || '',
  authDomain: parameters.get('authDomain') || '',
  projectId: parameters.get('projectId') || '',
  storageBucket: parameters.get('storageBucket') || '',
  messagingSenderId: parameters.get('messagingSenderId') || '',
  appId: parameters.get('appId') || ''
};

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(payload => {
    // Notification payloads are displayed automatically by FCM. Data-only
    // messages are rendered here so future server-side triggers use one worker.
    if (payload.notification) return;
    const title = payload.data?.title || 'Smart Finance';
    const options = {
      body: payload.data?.body || '새로운 알림이 도착했습니다.',
      icon: './assets/icon-192.png',
      badge: './assets/icon-192.png',
      tag: payload.data?.tag || 'smart-finance-notification',
      data: { url: payload.data?.url || './' }
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destination = new URL(event.notification.data?.url || './', self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const existingClient = windowClients.find(client => client.url.startsWith(self.registration.scope));
      if (existingClient) {
        existingClient.navigate(destination);
        return existingClient.focus();
      }
      return clients.openWindow(destination);
    })
  );
});
