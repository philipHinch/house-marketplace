import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqQ5wXnakFw_YV4ZWIqCKHmKH9qqk9huQ",
    authDomain: "house-marketplace-app-51b0e.firebaseapp.com",
    projectId: "house-marketplace-app-51b0e",
    storageBucket: "house-marketplace-app-51b0e.appspot.com",
    messagingSenderId: "97246171743",
    appId: "1:97246171743:web:de1010be784efe73bf81ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore()