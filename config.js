import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_fBweLcJqxg4ao6mYPK5SmORPuykGyaY",
  authDomain: "uthau-ba036.firebaseapp.com",
  projectId: "uthau-ba036",
  storageBucket: "uthau-ba036.appspot.com",
  messagingSenderId: "598168032735",
  appId: "1:598168032735:web:db8dc8b9fb811273cf606a",
};

export default !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();
