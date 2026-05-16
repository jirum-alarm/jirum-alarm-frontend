importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ',
  authDomain: 'jirumalarm-b25f9.firebaseapp.com',
  projectId: 'jirumalarm-b25f9',
  storageBucket: 'jirumalarm-b25f9.appspot.com',
  messagingSenderId: '570660841537',
  appId: '1:570660841537:web:f7b68d980e7a30daffbec0',
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    data: {
      title: notificationTitle,
      body: payload.notification.body,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
      const focused = clients.find(function (c) {
        return c.focused;
      });
      const target = focused || clients[0];
      if (target) {
        target.postMessage({
          type: 'push_notification_clicked',
          push_title: data.title,
          push_body: data.body,
        });
        return target.focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});
