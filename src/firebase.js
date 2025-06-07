import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCh--07kfkDYkzvL6rDqMwy9Hwp5Eihvk",
  authDomain: "voxa-a6f17.firebaseapp.com",
  projectId: "voxa-a6f17",
  storageBucket: "voxa-a6f17.firebasestorage.app",
  messagingSenderId: "1096230987912",
  appId: "1:1096230987912:web:0e45490b42fe152016173d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
