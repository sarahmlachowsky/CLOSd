import React, { useState, useEffect } from 'react';
import StepWelcome from './StepWelcome';
import StepTeamSetup from './StepTeamSetup';
import StepDefaultAssignments from './StepDefaultAssignments';
import StepComplete from './StepComplete';
import {
  getMembers,
  addMember,
  getDefaultAssignments,
  saveDefaultAssignment,
  updateOnboardingStep,
  completeOnboarding,
} from '../../services/firestoreService';

const STEP_LABELS = [
  'Welcome',
  'Team Setup',
  'Seller Defaults',
  'Buyer Defaults',
  'All Set!',
];

const OnboardingWizard = ({
  orgId,
  currentUser,
  initialStep = 0,
  onComplete,
  onCreateDeal,
}) => {
  const [step, setStep] = useState(initialStep);
  const [teamMembers, setTeamMembers] = useState([]);
  const [existingDefaults, setExistingDefaults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load existing team members and defaults on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const members = await getMembers(orgId);
        setTeamMembers(members || []);

        const defaultsObj = await getDefaultAssignments(orgId);
        // Convert object map to array for StepDefaultAssignments
        const defaultsArray = defaultsObj
          ? Object.values(defaultsObj)
          : [];
        setExistingDefaults(defaultsArray);
      } catch (err) {
        console.error('Error loading onboarding data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, [orgId]);

  const goToStep = async (newStep) => {
    setStep(newStep);
    try {
      await updateOnboardingStep(orgId, newStep);
    } catch (err) {
      console.error('Error saving onboarding step:', err);
    }
  };

  const handleAddMembers = async (newMembers) => {
    try {
      for (const member of newMembers) {
        await addMember(orgId, {
          name: member.name,
          email: member.email || '',
          phone: member.phone || '',
          role: member.role || 'TC',
          notificationPreference: 'email',
        });
      }
      // Reload members list
      const updated = await getMembers(orgId);
      setTeamMembers(updated || []);
    } catch (err) {
      console.error('Error adding team members:', err);
    }
  };

  const handleSaveDefaults = async (assignmentsArray) => {
    try {
      for (const assignment of assignmentsArray) {
        await saveDefaultAssignment(orgId, assignment);
      }
      // Reload defaults
      const updatedObj = await getDefaultAssignments(orgId);
      const updatedArray = updatedObj ? Object.values(updatedObj) : [];
      setExistingDefaults(updatedArray);
    } catch (err) {
      console.error('Error saving default assignments:', err);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(orgId);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
    onComplete();
  };

  const handleCreateDeal = async () => {
    try {
      await completeOnboarding(orgId);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
    onCreateDeal();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Progress Bar */}
      {step < 4 && (
        <div style={styles.progressSection}>
          <p style={styles.stepIndicator}>
            Step {step + 1} of {STEP_LABELS.length}
          </p>
          <div style={styles.progressTrack}>
            {STEP_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  ...styles.progressDot,
                  ...(i <= step ? styles.progressDotActive : {}),
                }}
              >
                <div
                  style={{
                    ...styles.dot,
                    ...(i <= step ? styles.dotActive : {}),
                    ...(i === step ? styles.dotCurrent : {}),
                  }}
                />
                <span
                  style={{
                    ...styles.dotLabel,
                    ...(i === step ? styles.dotLabelActive : {}),
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
            {/* Connecting line */}
            <div style={styles.progressLine}>
              <div
                style={{
                  ...styles.progressLineFill,
                  width: `${(step / (STEP_LABELS.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div style={styles.stepContent}>
        {step === 0 && (
          <StepWelcome onNext={() => goToStep(1)} />
        )}

        {step === 1 && (
          <StepTeamSetup
            existingMembers={teamMembers}
            onAddMembers={handleAddMembers}
            onNext={() => goToStep(2)}
            onSkip={() => goToStep(2)}
          />
        )}

        {step === 2 && (
          <StepDefaultAssignments
            dealType="Seller"
            teamMembers={teamMembers}
            existingDefaults={existingDefaults}
            onSaveDefaults={handleSaveDefaults}
            onNext={() => goToStep(3)}
            onSkip={() => goToStep(3)}
          />
        )}

        {step === 3 && (
          <StepDefaultAssignments
            dealType="Buyer"
            teamMembers={teamMembers}
            existingDefaults={existingDefaults}
            onSaveDefaults={handleSaveDefaults}
            onNext={() => goToStep(4)}
            onSkip={() => goToStep(4)}
          />
        )}

        {step === 4 && (
          <StepComplete
            onCreateDeal={handleCreateDeal}
            onGoToDashboard={handleComplete}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 16,
    color: '#516469',
  },
  progressSection: {
    width: '100%',
    maxWidth: 600,
    padding: '32px 24px 0 24px',
    boxSizing: 'border-box',
  },
  stepIndicator: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#89A8B1',
    textAlign: 'center',
    margin: '0 0 16px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  progressTrack: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    padding: '0 10px',
  },
  progressDot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
    minWidth: 60,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
    transition: 'all 0.3s ease',
  },
  dotActive: {
    backgroundColor: '#75BB2E',
  },
  dotCurrent: {
    width: 18,
    height: 18,
    boxShadow: '0 0 0 4px rgba(117, 187, 46, 0.2)',
  },
  dotLabel: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 11,
    color: '#89A8B1',
    textAlign: 'center',
  },
  dotLabelActive: {
    color: '#071D39',
    fontWeight: 600,
  },
  progressLine: {
    position: 'absolute',
    top: 7,
    left: 40,
    right: 40,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    zIndex: 0,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#75BB2E',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  stepContent: {
    width: '100%',
    flex: 1,
  },
};

export default OnboardingWizard;