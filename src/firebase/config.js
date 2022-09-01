// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import { getAuth } from 'firebase/auth';

import {getFirestore, initializeFirestore} from 'firebase/firestore';

import {getStorage} from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_Y3KQ8Tz6bbrfbTfGQg5SPb3PBmplKVo",
    authDomain: "profound-veld-357709.firebaseapp.com",
    projectId: "profound-veld-357709",
    storageBucket: "profound-veld-357709.appspot.com",
    messagingSenderId: "31324684989",
    appId: "1:31324684989:web:0d2f8c18e7f2b636352dd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeFirestore(app, {experimentalAutoDetectLongPolling: true});

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);