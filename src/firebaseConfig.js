import { initializeApp } from "firebase/app";
import {
  getAuth, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKHkmEsnNOcQk_53gs3doaqRd492fFemE",
  authDomain: "yashmusic-c65cf.firebaseapp.com",
  projectId: "yashmusic-c65cf",
  storageBucket: "yashmusic-c65cf.appspot.com",
  messagingSenderId: "249187949873",
  appId: "1:249187949873:web:4ac53a792c8f9e000a2410"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // The signed-in user info
    const user = result.user;
    return user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export { auth };