import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
// /////////////////////// my
// Initialize the Firebase app in the service worker by passing in your app's Firebase config object.
const firebaseConfig = {
  apiKey: "AIzaSyByQ_FqUKquTi0K7mhvSQFS0HStVnk-nGc",
  authDomain: "testfcm-e974f.firebaseapp.com",
  projectId: "testfcm-e974f",
  storageBucket: "testfcm-e974f.appspot.com",
  messagingSenderId: "848567466909",
  appId: "1:848567466909:web:641b9da7a68f25c0e24d74",
  measurementId: "G-9SLWYM5BGJ",
  databaseURL: "https://testpwa-400ab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  msgVapidKey: "BKiF1zK2yb- 9-pfsx4VLnf6qY_CwZjWkADl42t7kJnSfb2ydcKi5YWndAQpuTpXwqR3oOYkJWzNG0mzi-rO5Lik"
};
// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("sw > [firebase-messaging-sw.js] Received background message ", payload);
  // self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("install", function (e) {
  console.log("sw > install");
});
self.addEventListener("activate", function (e) {
  console.log("sw > activate");
});
self.addEventListener("fetch", function (e) {
  console.log("sw > fetch");
});
self.addEventListener("push", function (e) {
  console.log("sw > push");
});
