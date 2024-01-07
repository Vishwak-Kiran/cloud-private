import { getAuth } from "firebase/auth"; // import getAuth
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // import getFirestore

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkF2nuFhyqdrqGKUU9EjtKYkSEURogh0A",
  authDomain: "eduapp-a334b.firebaseapp.com",
  projectId: "eduapp-a334b",
  storageBucket: "eduapp-a334b.appspot.com",
  messagingSenderId: "402865479446",
  appId: "1:402865479446:web:d584879a21a7c782b9ba37",
  measurementId: "G-18SBTQ1GK2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
export { app, analytics, auth , db};
