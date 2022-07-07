import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getDatabase, ref, set, onValue, remove, update } from "firebase/database";
import dialogPolyfill from "dialog-polyfill";

(async function () {
  const firebaseConfig = {
    apiKey: "AIzaSyByhp6DO2hWpnI1yQQC76ohBrKyZstW0D0",
    authDomain: "bti-internal-tw01.firebaseapp.com",
    projectId: "bti-internal-tw01",
    storageBucket: "bti-internal-tw01.appspot.com",
    messagingSenderId: "15410839894", //
    appId: "1:15410839894:web:ce65fb24a12d9f8838d6f7",
    measurementId: "G-GMBHD16PHR",
    // self add
    databaseURL: "https://bti-internal-tw01-default-rtdb.asia-southeast1.firebasedatabase.app/", // 資料庫的路徑
    msgVapidKey: "BE4mTk7AMST4I2LJxLztEOOSTZ_wMlsxTJmkfb5SijkIFixMe9ywKaoyh72QHUbjeJsF4WY6d2Eyp4p0pD1oapA"
  };

  // /////////////////////// my
  // const firebaseConfig = {
  //   apiKey: "AIzaSyByQ_FqUKquTi0K7mhvSQFS0HStVnk-nGc",
  //   authDomain: "testfcm-e974f.firebaseapp.com",
  //   projectId: "testfcm-e974f",
  //   storageBucket: "testfcm-e974f.appspot.com",
  //   messagingSenderId: "848567466909",
  //   appId: "1:848567466909:web:641b9da7a68f25c0e24d74",
  //   measurementId: "G-9SLWYM5BGJ",
  //   databaseURL: "https://testpwa-400ab-default-rtdb.asia-southeast1.firebasedatabase.app/",
  //   msgVapidKey: "BNgmX1a8F3F7DJvxvI_1FM4oXrTi9HqE9OeobnufmN9KcMUHO0GiRInb4uq6jHIenDqxpW5NVl_qxfy9qZ4VCAU"
  // };
  // /////////////////////// #my
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  //
  const dialog = document.querySelector("dialog");
  dialogPolyfill.registerDialog(dialog);
  //
  const userName = getCname("userName");
  const teachUi = document.querySelector("#my_notify2");
  const db = getDatabase();
  const startRef = ref(db, `users/`);
  let hasUser;

  //
  // =============================================================
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    const options = {
      body: ":DDD" + payload.notification.body,
      icon: payload.notification.icon
    };
    let myNotify = new Notification("~~~~" + payload.notification.title, options);
  });
  onValue(startRef, (snapshot) => {
    const data = snapshot.val();
    //
    console.log("onValue:", data);
    if (data?.hasOwnProperty(userName)) {
      hasUser = true;
    }
  });

  // order btn ui
  document.querySelector(".btn[data-val=onan]").addEventListener("click", function (e) {
    teachUi.showModal();
  });
  // teachUi
  teachUi.querySelector(".btn[data-val=my_notify2_ok]").addEventListener("click", function (e) {
    teachUi.close();
  });
  //
  // =============================================================
  // 瀏覽器支援 sw?
  // if ("serviceWorker" in navigator) {
  // 有支援 && 且尚未授權 才出現訂閱按鈕
  // 如果要訂閱才點訂閱按鈕
  // 訂閱按鈕出現解鎖說明 (...below)
  // 允許後自動關閉解鎖說明 (與移除按鈕)
  // =============
  console.log("/// userName:", userName, "/// hasUser", hasUser, "/// my Notification.permission:", Notification.permission);
  //
  if (Notification.permission === "granted") {
    // user 重新產生訂閱，新增新的 token
    getToken(messaging, { vapidKey: firebaseConfig.msgVapidKey })
      .then((currentToken) => {
        // 取本機 token
        console.log(currentToken);
        return updateUserData(Notification.permission, currentToken);
      })
      .catch((err) => {
        console.log("!!! firebase getToken ERROR. ", err);
      });
  } else if (Notification.permission === "default") {
    // 詢問 是否訂閱 // user data 重設
    initPermission();
  } else if (Notification.permission === "denied") {
    // user 改為不訂閱
    updateUserData(Notification.permission);
  }
  // =============================================================
  function initPermission() {
    // 說明 ui
    teachUi.showModal();
    // brw 是否訂閱
    Notification.requestPermission().then(function (answer) {
      if (answer === "granted") {
        teachUi.close();
        // 有 br 許可，建立 getToken 送 fire
        saveUser(answer);
      }
    });
  }
  function saveUser(isSub) {
    getToken(messaging, { vapidKey: firebaseConfig.msgVapidKey })
      .then((currentToken) => {
        if (currentToken) {
          // 取本機 token
          console.log(currentToken);

          let devices = {};
          devices[currentToken] = true;

          const db = getDatabase();
          // user order
          set(ref(db, `users/${userName}`), {
            token: devices,
            timeStamp: Date.now(),
            state: isSub
          })
            .then(() => {
              console.log("saveUser ok");
            })
            .catch((error) => {
              console.log("saveUser err");
            });
        }
      })
      .catch((err) => {
        console.log("!!! firebase getToken ERROR. ", err);
      });
  }
  function updateUserData(answer, ctk) {
    console.log("---updateUserData---");
    const db = getDatabase();
    let updates = {};
    updates[`users/${userName}/timeStamp`] = Date.now();
    updates[`/users/${userName}/state`] = answer;
    if (ctk) {
      updates[`/users/${userName}/token/${ctk}`] = answer === "granted";
    } else {
      updates[`/users/${userName}/token`] = null;
    }
    // token 清空?
    update(ref(db), updates)
      .then(() => {
        console.log("updateUserData ok");
      })
      .catch((error) => {
        console.log("updateUserData err");
      });
  }

  function delUser() {
    // 移除 user
    const db = getDatabase();
    remove(ref(db, `users/${userName}`))
      .then(() => {
        console.log("delUser ok");
      })
      .catch((error) => {
        console.log("delUser err");
      });
  }
  function getCname(cname) {
    let userName = getCookieVal(cname);
    if (!userName) {
      userName = prompt("username?");
      setCookie(cname, userName);
    }
    return userName;
  }
  // ==========================================
  // Utilities
  //
  function getCookieVal(cName) {
    // console.log(`getCookieVal(${cName})`);

    let decodedCookie = decodeURIComponent(document.cookie);
    // console.log("decodedCookie", decodedCookie); // <string: "cname1=cVal1; cname2=cVal2">
    let cookieArr = decodedCookie.split(";"); // [cname1=cVal1, cname2=cVal2]

    let name = cName + "=";
    for (let i = 0; i < cookieArr.length; i++) {
      let c = cookieArr[i].trim();
      if (c.indexOf(name) == 0) {
        // 一開始就符合 === name
        // 取 name 之後~結尾 字串 === value
        return c.substring(name.length, c.length);
      }
    }
    // 都沒有
    // console.log("getCookieVal(), no", cName);
    return "";
  }
  function isCookie(cName) {
    // console.log("isCookie()");
    // cookie 以 ';' 分為 array.
    // arr 各元素 c 字串, 是否有以 cName= 為開頭? boo
    return document.cookie.split(";").some((c) => {
      return c.trim().startsWith(cName + "=");
    });
  }
  function setCookie(cName, cValue, hr) {
    // console.log(`setCookie(${cName}, ${cValue}, ${hr})`);
    let maxAge = hr === undefined ? 3600 * 24 : 3600 * hr; // 3600sec = 1h;
    document.cookie = `${cName}=${cValue};max-age=${maxAge};path=/`;
  }
  function deleteCookie(name, path, domain) {
    // console.log(`deleteCookie(${name})`);
    if (isCookie(name)) {
      document.cookie = name + "=" + (path ? ";path=" + path : "") + (domain ? ";domain=" + domain : "") + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }
})();
