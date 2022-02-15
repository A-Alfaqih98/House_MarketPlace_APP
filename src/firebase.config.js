import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCwBdQUtv8F7WEsdnNgT3wYw_Yt4-xlM8I',
  authDomain: 'house-marketplace-app-68f94.firebaseapp.com',
  projectId: 'house-marketplace-app-68f94',
  storageBucket: 'house-marketplace-app-68f94.appspot.com',
  messagingSenderId: '939680460004',
  appId: '1:939680460004:web:762c0734ed4e2abfc010f1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
