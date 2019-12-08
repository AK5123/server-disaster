let firebase=require('firebase-admin');
const firebaseConfig = {
    apiKey: "AIzaSyBtvYWVAcGIo6reOw0JBqMHAfGygl_HIhI",
    authDomain: "three-eyed-raven-e67c5.firebaseapp.com",
    databaseURL: "https://three-eyed-raven-e67c5.firebaseio.com",
    projectId: "three-eyed-raven-e67c5",
    storageBucket: "three-eyed-raven-e67c5.appspot.com",
    messagingSenderId: "472326462664",
    appId: "1:472326462664:web:f3018394f4445e750419fd",
    measurementId: "G-9348L0XFEC"
  };

firebase=firebase.initializeApp(firebaseConfig);

module.exports=firebase;
