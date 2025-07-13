// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, GoogleAIBackend } from "firebase/ai";

// Add TypeScript interface declaration for the debug token
declare global {
    interface Window {
        FIREBASE_APPCHECK_DEBUG_TOKEN: string | boolean;
    }
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAR6FOSLzPi8J4GwUqsJ0lKRKM_Sqe2Kgo",
    authDomain: "the-tree-hole-forum.firebaseapp.com",
    projectId: "the-tree-hole-forum",
    storageBucket: "the-tree-hole-forum.firebasestorage.app",
    messagingSenderId: "60599767186",
    appId: "1:60599767186:web:e78a6e46eac21aa2a9564b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LeVMIErAAAAACUfOmQ-7J1BhlW9uF9KgNen1TyE'),
    isTokenAutoRefreshEnabled: true
});

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

export { app, appCheck, ai };
