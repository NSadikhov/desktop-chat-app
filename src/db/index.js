import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

// Outdated Firebase Config
// TODO: Implement Environment Variables for firebaseConfig
const firebaseConfig = {
    apiKey: "AIzaSyDIqqNlNnki8fxn121ZJfnianNwG8mUZn0",
    authDomain: "telex-6d940.firebaseapp.com",
    projectId: "telex-6d940",
    storageBucket: "telex-6d940.appspot.com",
    messagingSenderId: "511900884840",
    appId: "1:511900884840:web:a7ad74363ef4fff39a00dd",
    measurementId: "G-71LKHFZ3JM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { firebase, db, auth, storage };