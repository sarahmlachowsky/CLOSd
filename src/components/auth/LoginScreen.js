import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const finishLogin = async (uid, email) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    onLogin({
      uid, email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
    });
  };

  const handleSubmit = async () => {
    if (!email || !password) return;
    if (isSignup && (!firstName || !lastName)) {
      alert("Please enter first and last name.");
      return;
    }
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        await sendEmailVerification(userCredential.user);
        await setDoc(doc(db, "users", uid), { uid, email, firstName, lastName, createdAt: serverTimestamp() });
        alert("Check your email to verify your account (also check spam/junk). After you verify, come back and log in.");
        await signOut(auth);
        return;
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          alert("Please verify your email address before logging in. Check your inbox (and spam/junk).");
          return;
        }
        await finishLogin(userCredential.user.uid, email);
      }
    } catch (error) {
      console.error("Firebase auth error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(to bottom right, #071D39, #516469)' }}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src="/closd-logo.png" alt="CLOSD Logo" className="h-32 w-auto object-contain" />
          </div>
        </div>
        <div className="space-y-4">
          {isSignup && (
            <>
              <input type="text" placeholder="First Name" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border rounded" style={{ borderColor: "#89A8B1" }} />
              <input type="text" placeholder="Last Name" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border rounded" style={{ borderColor: "#89A8B1" }} />
            </>
          )}
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded" style={{ borderColor: '#89A8B1' }} />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-3 border rounded" style={{ borderColor: '#89A8B1' }} />
          <button onClick={handleSubmit} className="w-full text-white p-3 rounded font-semibold"
            style={{ backgroundColor: '#516469' }}>Sign In</button>
          <div className="text-center mt-4">
            <button type="button" onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:underline">
              {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
