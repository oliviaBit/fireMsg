import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getDatabase, ref, set, remove } from "firebase/database";
import dialogPolyfill from "dialog-polyfill";

// const firebaseConfig = {
//   apiKey: "AIzaSyByhp6DO2hWpnI1yQQC76ohBrKyZstW0D0",
//   authDomain: "bti-internal-tw01.firebaseapp.com",
//   projectId: "bti-internal-tw01",
//   storageBucket: "bti-internal-tw01.appspot.com",
//   messagingSenderId: "15410839894", //
//   appId: "1:15410839894:web:ce65fb24a12d9f8838d6f7",
//   measurementId: "G-GMBHD16PHR",
//   // self add
//   databaseURL: "https://bti-internal-tw01-default-rtdb.asia-southeast1.firebasedatabase.app/", // 資料庫的路徑
//
//   msgVapidKey: "BE4mTk7AMST4I2LJxLztEOOSTZ_wMlsxTJmkfb5SijkIFixMe9ywKaoyh72QHUbjeJsF4WY6d2Eyp4p0pD1oapA"
// };
// /////////////////////// my
const firebaseConfig = {
  apiKey: "AIzaSyByQ_FqUKquTi0K7mhvSQFS0HStVnk-nGc",
  authDomain: "testfcm-e974f.firebaseapp.com",
  projectId: "testfcm-e974f",
  storageBucket: "testfcm-e974f.appspot.com",
  messagingSenderId: "848567466909",
  appId: "1:848567466909:web:641b9da7a68f25c0e24d74",
  measurementId: "G-9SLWYM5BGJ",
  databaseURL: "https://testpwa-400ab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  msgVapidKey: "BKiF1zK2yb-9-pfsx4VLnf6qY_CwZjWkADl42t7kJnSfb2ydcKi5YWndAQpuTpXwqR3oOYkJWzNG0mzi-rO5Lik"
};
// /////////////////////// my

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
//
const dialog = document.querySelector("dialog");
dialogPolyfill.registerDialog(dialog);
const teachUi = document.querySelector("#my_notify2");

console.log("my Notification.permission:", Notification.permission);

if (Notification.permission === "granted") {
  orderNotify();
} else if (Notification.permission === "default") {
  // 說明 ui
  teachUi.showModal();
  // br: 是否訂閱
  Notification.requestPermission().then(function (answer) {
    if (answer === "granted") {
      teachUi.close();
      // 有 br 許可，建立 getToken 送 fire
      orderNotify();
    }
  });
} else if (Notification.permission === "denied") {
  // 移除資料庫 token
  disOrderNotify();
}

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  const options = {
    body: ":DDD" + payload.notification.body,
    icon: payload.notification.icon
  };
  let myNotify = new Notification("~~~~" + payload.notification.title, options);
});

// 瀏覽器支援 sw?
// if ("serviceWorker" in navigator) {
// 有支援 && 且尚未授權 才出現訂閱按鈕
// 如果要訂閱才點訂閱按鈕
// 訂閱按鈕出現解鎖說明 (...below)
// 允許後自動關閉解鎖說明 (與移除按鈕)
// =============

// order btn ui
document.querySelector(".btn[data-val=onan]").addEventListener("click", function (e) {
  teachUi.showModal();
});
// teachUi
teachUi.querySelector(".btn[data-val=my_notify2_ok]").addEventListener("click", function (e) {
  teachUi.close();
});
// }

// =============================================================
function orderNotify() {
  getToken(messaging, { vapidKey: firebaseConfig.msgVapidKey })
    .then((currentToken) => {
      if (currentToken) {
        console.log(currentToken);
        // save to fire-realtime
        const db = getDatabase();
        set(ref(db, "users/oliviah"), {
          currentToken: currentToken
        })
          .then(() => {
            console.log("user order ok");
          })
          .catch((error) => {
            console.log("user order err");
          });
      }
    })
    .catch((err) => {
      console.log("!!! firebase getToken ERROR. ", err);
    });
}
function disOrderNotify() {
  // 移除資料庫 token
  const db = getDatabase();
  remove(ref(db, "users/oliviah"))
    .then(() => {
      // Data saved successfully!
      console.log("remove user from real ok");
    })
    .catch((error) => {
      // The write failed...
      console.log("remove user from real err");
    });
}
