// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKHkmEsnNOcQk_53gs3doaqRd492fFemE",
  authDomain: "yashmusic-c65cf.firebaseapp.com",
  projectId: "yashmusic-c65cf",
  storageBucket: "yashmusic-c65cf.firebasestorage.app",
  messagingSenderId: "249187949873",
  appId: "1:249187949873:web:4ac53a792c8f9e000a2410",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Google Auth Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// 🔹 Sign in with Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result);
    return result.user;
  } catch (error) {
    console.error("Google Sign-in Error:", error.code, error.message);
    throw error;
  }
};

// 🔹 Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error.message);
    throw error;
  }
};

// 🔹 Listen to auth state change
export const onAuthStateChanged = (callback) =>
  firebaseOnAuthStateChanged(auth, callback);

export { auth };