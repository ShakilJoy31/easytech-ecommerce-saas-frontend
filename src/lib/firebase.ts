// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBTIT_avOOwcvQTtRfvZEMJUH4mOZq_mAo",
  authDomain: "fit-info-tech.firebaseapp.com",
  projectId: "fit-info-tech",
  storageBucket: "fit-info-tech.firebasestorage.app",
  messagingSenderId: "1076834260409",
  appId: "1:1076834260409:web:5644c924051a1d06479268",
  measurementId: "G-YX28MZRVFH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection
});

export { auth, googleProvider, signInWithPopup, signInWithRedirect };