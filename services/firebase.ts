import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuLWjQzPaygKXRw_rst8CzdRkDG3t26go",
  authDomain: "food-box-smart.firebaseapp.com",
  projectId: "food-box-smart",
  storageBucket: "food-box-smart.firebasestorage.app",
  messagingSenderId: "804901002522",
  appId: "1:804901002522:web:b7b93c3d16dcc2de99e0a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);