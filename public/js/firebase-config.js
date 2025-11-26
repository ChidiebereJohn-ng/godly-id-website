// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4yrQRjIT16GocdOTtf1H3cOlZGN7Ty0c",
  authDomain: "godly-backend.firebaseapp.com",
  projectId: "godly-backend",
  storageBucket: "godly-backend.firebasestorage.app",
  messagingSenderId: "64767835188",
  appId: "1:64767835188:web:62cb15f13188a30b9f1e61",
  measurementId: "G-L3BKL6FYDV"
};

// Expose config globally (since we are using module imports in some places and script tags in others, 
// keeping it simple for now as per Phase 1)
window.firebaseConfig = firebaseConfig;
