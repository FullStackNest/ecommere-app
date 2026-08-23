// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCloInOmndAjtcdqPEdmz7O1dLKa1GgPUw",
    authDomain: "ecommerce-app-s12.firebaseapp.com",
    projectId: "ecommerce-app-s12",
    storageBucket: "ecommerce-app-s12.firebasestorage.app",
    messagingSenderId: "550200652644",
    appId: "1:550200652644:web:975c0d19ccc7f734fd8071"
};

// Initialize Firebase
const APP = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig);

export const DB = getFirestore(APP);