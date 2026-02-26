import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase";
import {
  createUserProfile,
  getUserProfile,
  updateLastLogin,
  createOrganization,
  addMember,
} from "../../services/firestoreService";
import { isSuperAdminEmail } from "../../services/superAdminConfig";

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const finishLogin = async (uid, email) => {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      alert("Account data not found. Please contact support.");
      return;
    }

    // Auto-upgrade to superAdmin if email matches config
    let platformRole = userProfile.platformRole || 'user';
    if (isSuperAdminEmail(email) && platformRole !== 'superAdmin') {
      platformRole = 'superAdmin';
      await updateLastLogin(uid); // we'll update role in the same step below
      const { updateUserProfile } = await import("../../services/firestoreService");
      await updateUserProfile(uid, { platformRole: 'superAdmin' });
    }

    onLogin({
      uid,
      email,
      firstName: userProfile.firstName || "",
      lastName: userProfile.lastName || "",
      orgId: userProfile.orgId || null,
      platformRole,
    });
  };

  const handleSubmit = async () => {
    if (!email || !password) return;
    if (isSignup && (!firstName || !lastName)) {
      alert("Please enter first and last name.");
      return;
    }
    if (isSignup && !teamName.trim()) {
      alert("Please enter your team or company name.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // 1. Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Send verification email
        await sendEmailVerification(userCredential.user);

        // 3. Create user profile in Firestore (/users/{uid})
        const platformRole = isSuperAdminEmail(email) ? 'superAdmin' : 'user';
        await createUserProfile(uid, { email, firstName, lastName, platformRole });

        // 4. Create organization in Firestore (/organizations/{orgId})
        //    This also links the user to the org (sets orgId on user doc)
        const newOrgId = await createOrganization(uid, teamName.trim());

        // 5. Add owner as the first team member (admin)
        await addMember(newOrgId, {
          uid,
          firstName,
          lastName,
          email,
          phone: '',
          role: 'admin',
          notificationPreference: 'email',
        });

        alert(
          "Check your email to verify your account (also check spam/junk). After you verify, come back and log in."
        );
        await signOut(auth);
      } else {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          alert("Please verify your email address before logging in. Check your inbox (and spam/junk).");
          setLoading(false);
          return;
        }

        // Update last login timestamp
        try {
          await updateLastLogin(userCredential.user.uid);
        } catch (e) {
          console.warn("Could not update last login:", e);
          // Non-blocking — don't prevent login over this
        }

        await finishLogin(userCredential.user.uid, email);
      }
    } catch (error) {
      console.error("Firebase auth error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ background: 'linear-gradient(to bottom right, #071D39, #516469)' }}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img
              src="/closd-logo.png"
              alt="CLOSD Logo"
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>
        <div className="space-y-4">
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 border rounded"
                style={{ borderColor: "#89A8B1" }}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 border rounded"
                style={{ borderColor: "#89A8B1" }}
              />
              <input
                type="text"
                placeholder="Team / Company Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-3 border rounded"
                style={{ borderColor: "#89A8B1" }}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white p-3 rounded font-semibold"
            style={{
              backgroundColor: loading ? '#8a9a9e' : '#516469',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Sign In'}
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignup
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
