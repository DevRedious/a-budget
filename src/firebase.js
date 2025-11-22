import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBQmlMXeZme9tfZLGmTflwQVYo7BOPtg1s",
  authDomain: "budget-mp-fbefa.firebaseapp.com",
  projectId: "budget-mp-fbefa",
  storageBucket: "budget-mp-fbefa.firebasestorage.app",
  messagingSenderId: "780986627482",
  appId: "1:780986627482:web:4cda83b122509c59927623",
  measurementId: "G-Z48Z160GNH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;