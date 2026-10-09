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

// 백그라운드 알림은 SDK 가 직접 띄운다(서버 메시지에 notification 블록이 있으므로). 누르면 서버가 넣은
// webpush.fcm_options.link(딜 상세)를 SDK 가 연다. 예전처럼 onBackgroundMessage 에서 또 showNotification 하면
// 같은 알림이 두 번 떴고, 우리 것은 눌러도 홈(/)만 열렸다.

// 아래 클릭 처리는 페이지가 열려 있을 때 FCMConfig 가 직접 띄운 알림용이다(SDK 알림 클릭은 SDK 가 먼저 가져간다).
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
          link: data.link,
        });
        return target.focus();
      }
      return self.clients.openWindow(data.link || '/');
    }),
  );
});
