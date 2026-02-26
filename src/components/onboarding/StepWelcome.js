import React from 'react';

const StepWelcome = ({ onNext }) => {
  return (
    <div style={styles.container}>
      <img
        src="/closd-logo-white-bg.png"
        alt="CLOSd Logo"
        style={styles.logo}
      />
      <h1 style={styles.heading}>Welcome to CLOSd!</h1>
      <p style={styles.subtext}>
        Let's get your account set up in under 5 minutes. We'll walk you through
        adding your team and setting up default task assignments so every new deal
        is ready to go from day one.
      </p>
      <p style={styles.note}>
        You can skip any step and come back to it later — no pressure.
      </p>
      <button style={styles.button} onClick={onNext}>
        Let's Get Started
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 24px',
    maxWidth: 520,
    margin: '0 auto',
  },
  logo: {
    width: 180,
    marginBottom: 32,
  },
  heading: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 700,
    fontSize: 28,
    color: '#071D39',
    margin: '0 0 16px 0',
  },
  subtext: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 400,
    fontSize: 16,
    color: '#516469',
    lineHeight: 1.6,
    margin: '0 0 12px 0',
  },
  note: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 400,
    fontSize: 14,
    color: '#89A8B1',
    fontStyle: 'italic',
    margin: '0 0 32px 0',
  },
  button: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    backgroundColor: '#75BB2E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '14px 48px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

export default StepWelcome;