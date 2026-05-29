// ═══════════════════════════════════════════════════════
// C.R.O.M.A.D.H. — CONFIGURACIÓN FIREBASE
// NO modificar este archivo
// ═══════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
  runTransaction, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyDFz_kyVCj1msSjhg8OZzuMT984C7UQeCM",
  authDomain:        "protocolo-aletheia-foro.firebaseapp.com",
  projectId:         "protocolo-aletheia-foro",
  storageBucket:     "protocolo-aletheia-foro.firebasestorage.app",
  messagingSenderId: "538621416864",
  appId:             "1:538621416864:web:d9b2dca79182332de080c5"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

export {
  db,
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
  runTransaction, onSnapshot, serverTimestamp
};
