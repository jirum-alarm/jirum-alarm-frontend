importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ',
  authDomain: 'jirumalarm-b25f9.firebaseapp.com',
  projectId: 'jirumalarm-b25f9',
  storageBucket: 'jirumalarm-b25f9.appspot.com',
  messagingSenderId: '570660841537',
  appId: '1:570660841537:web:f7b68d980e7a30daffbec0',
  measurementId: 'G-BDBEZ4F35Z',
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
