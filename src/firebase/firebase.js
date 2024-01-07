import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth"; // import getAuth
// Import getDatabase

const firebaseConfig = {
  apiKey: "AIzaSyDkF2nuFhyqdrqGKUU9EjtKYkSEURogh0A",
  authDomain: "eduapp-a334b.firebaseapp.com",
  databaseURL:
    "https://eduapp-a334b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eduapp-a334b",
  storageBucket: "eduapp-a334b.appspot.com",
  messagingSenderId: "402865479446",
  appId: "1:402865479446:web:d584879a21a7c782b9ba37",
  measurementId: "G-18SBTQ1GK2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Use 'db' for Firestore
const realdb = getDatabase(app); // Use 'realdb' for Realtime Database
const auth = getAuth(app);

export { app, db, auth, realdb }; // Export Firestore as 'db' and Realtime Database as 'realdb'
