import React, { useEffect, useState } from 'react';

const ConfettiPiece = ({ delay, left }) => {
  const colors = ['#75BB2E', '#071D39', '#89A8B1', '#FFD700', '#FF6B6B'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <div
      style={{
        position: 'absolute',
        top: -20,
        left: `${left}%`,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: 2,
        transform: `rotate(${rotation}deg)`,
        animation: `confettiFall 2.5s ease-in ${delay}s forwards`,
        opacity: 0,
      }}
    />
  );
};

const StepComplete = ({ onCreateDeal, onGoToDashboard }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Generate confetti pieces
  const confettiPieces = [];
  for (let i = 0; i < 60; i++) {
    confettiPieces.push(
      <ConfettiPiece
        key={i}
        delay={Math.random() * 1.5}
        left={Math.random() * 100}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Confetti animation styles */}
      <style>{`
        @keyframes confettiFall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(500px) rotate(720deg);
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* Confetti overlay */}
      {showConfetti && (
        <div style={styles.confettiContainer}>{confettiPieces}</div>
      )}

      {/* Checkmark circle */}
      <div
        style={{
          ...styles.checkCircle,
          animation: 'scaleIn 0.6s ease-out forwards',
        }}
      >
        <span style={styles.checkMark}>✓</span>
      </div>

      <h1 style={styles.heading}>You're All Set!</h1>
      <p style={styles.subtext}>
        Your account is ready to go. Your team is loaded, your default
        assignments are saved, and every new deal you create will come
        pre-configured. No more busywork.
      </p>
      <p style={styles.highlight}>
        Your first deal is just one click away.
      </p>

      <div style={styles.buttonColumn}>
        <button style={styles.primaryBtn} onClick={onCreateDeal}>
          Create Your First Deal
        </button>
        <button style={styles.secondaryBtn} onClick={onGoToDashboard}>
          Go to Dashboard
        </button>
      </div>
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
    position: 'relative',
    overflow: 'hidden',
    minHeight: 400,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: '#75BB2E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkMark: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 1,
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
    fontSize: 15,
    color: '#516469',
    lineHeight: 1.6,
    margin: '0 0 12px 0',
  },
  highlight: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    color: '#071D39',
    margin: '0 0 32px 0',
  },
  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  primaryBtn: {
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
    width: '100%',
    maxWidth: 320,
  },
  secondaryBtn: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    backgroundColor: 'transparent',
    color: '#516469',
    border: '1px solid #89A8B1',
    borderRadius: 8,
    padding: '12px 48px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    maxWidth: 320,
  },
};

export default StepComplete;