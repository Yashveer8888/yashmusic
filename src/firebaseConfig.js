import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKHkmEsnNOcQk_53gs3doaqRd492fFemE",
  authDomain: "yashmusic-c65cf.firebaseapp.com",
  projectId: "yashmusic-c65cf",
  storageBucket: "yashmusic-c65cf.appspot.com",
  messagingSenderId: "249187949873",
  appId: "1:249187949873:web:4ac53a792c8f9e000a2410"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider setup
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: "select_account"
});

// Sign in with Google
export const loginWithGoogle = async () => {
  try {
    // Use redirect for mobile, popup for desktop
    if (window.innerWidth <= 768 || window.navigator.userAgent.includes("Mobile")) {
      await signInWithRedirect(auth, googleProvider);
      return null; // Redirect flow will be handled by handleRedirectResult
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    throw error;
  }
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Redirect Error:", error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Auth state listener
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export { auth };