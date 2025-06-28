import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// ✅ Proper Firebase Config Object
const firebaseConfig = {
  apiKey: "AIzaSyB7WRcH4rF9GjHI2-OQs9Mp3B1fjLgI_8M",
  authDomain: "yashmusic-c65cf.firebaseapp.com",
  projectId: "yashmusic-c65cf",
  storageBucket: "yashmusic-c65cf.firebasestorage.app",
  messagingSenderId: "249187949873",
  appId: "process.env.REACT_APP_FIREBASE_APP_ID",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Google Login
const googleProvider = new GoogleAuthProvider();
export const loginWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    return user;
  } catch (error) {
    console.error("Google Sign-in Error:", error.code, error.message);
  }
};

// 🔹 Logout
export const logout = async (setUser) => {
  try {
    await signOut(auth);
    setUser(null);
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

export { auth };
