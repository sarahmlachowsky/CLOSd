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

    let platformRole = userProfile.platformRole || 'user';
    if (isSuperAdminEmail(email) && platformRole !== 'superAdmin') {
      platformRole = 'superAdmin';
      await updateLastLogin(uid);
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await sendEmailVerification(userCredential.user);

        const platformRole = isSuperAdminEmail(email) ? 'superAdmin' : 'user';
        await createUserProfile(uid, { email, firstName, lastName, platformRole });

        const newOrgId = await createOrganization(uid, teamName.trim());

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          alert("Please verify your email address before logging in. Check your inbox (and spam/junk).");
          setLoading(false);
          return;
        }

        try {
          await updateLastLogin(userCredential.user.uid);
        } catch (e) {
          console.warn("Could not update last login:", e);
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

  const inputStyle = {
    borderColor: '#89A8B1',
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: '14px',
    color: '#071D39',
  };

  const inputFocusClass = "w-full p-3 border rounded outline-none transition-all duration-200";

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{ background: 'linear-gradient(135deg, #071D39 0%, #516469 100%)' }}
    >
      <div
        className="bg-white p-10 rounded-xl shadow-2xl w-96"
        style={{ fontFamily: "'AvenirNext', sans-serif" }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/closd-logo-white-bg.png"
            alt="CLOSD Logo"
            className="h-20 w-auto mx-auto object-contain"
          />
          <p className="mt-3 text-sm" style={{ color: '#516469' }}>
            Real estate transactions, simplified.
          </p>
        </div>

        {/* Form heading */}
        <h2
          className="text-center text-lg mb-5"
          style={{ color: '#071D39', fontWeight: 600 }}
        >
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h2>

        <div className="space-y-3">
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputFocusClass}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputFocusClass}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Team / Company Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={inputFocusClass}
                style={inputStyle}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputFocusClass}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className={inputFocusClass}
            style={inputStyle}
          />

          {/* CTA Button — Brand Green */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white p-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              backgroundColor: loading ? '#89A8B1' : '#75BB2E',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'AvenirNext', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#071D39'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#75BB2E'; }}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Sign In'}
          </button>

          {/* Toggle link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm hover:underline"
              style={{ color: '#516469', fontFamily: "'AvenirNext', sans-serif" }}
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