import React, { useState } from 'react';

const emptyMember = { name: '', email: '', phone: '', role: 'TC' };

const StepTeamSetup = ({ existingMembers = [], onAddMembers, onNext, onSkip }) => {
  const [members, setMembers] = useState([{ ...emptyMember }]);
  const [error, setError] = useState('');

  const handleChange = (index, field, value) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
    setError('');
  };

  const addRow = () => {
    setMembers([...members, { ...emptyMember }]);
  };

  const removeRow = (index) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Filter out completely empty rows
    const filled = members.filter(
      (m) => m.name.trim() || m.email.trim()
    );

    if (filled.length === 0) {
      setError('Add at least one team member, or click "Skip for now."');
      return;
    }

    // Validate filled rows have at least a name
    for (let i = 0; i < filled.length; i++) {
      if (!filled[i].name.trim()) {
        setError(`Row ${i + 1} needs a name.`);
        return;
      }
    }

    onAddMembers(filled);
    onNext();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Who's on your team?</h1>
      <p style={styles.subtext}>
        Add your transaction coordinators, assistants, or anyone who works on
        deals with you. You can always add more people later in Team Settings.
      </p>

      {existingMembers.length > 0 && (
        <div style={styles.existingBox}>
          <p style={styles.existingLabel}>Already on your team:</p>
          {existingMembers.map((m, i) => (
            <span key={i} style={styles.existingChip}>
              {m.name || m.email}
            </span>
          ))}
        </div>
      )}

      <div style={styles.membersList}>
        {members.map((member, index) => (
          <div key={index} style={styles.memberRow}>
            <div style={styles.rowHeader}>
              <span style={styles.rowLabel}>Team Member {index + 1}</span>
              {members.length > 1 && (
                <button
                  style={styles.removeBtn}
                  onClick={() => removeRow(index)}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={styles.fieldGrid}>
              <input
                style={styles.input}
                placeholder="Full Name *"
                value={member.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Email"
                type="email"
                value={member.email}
                onChange={(e) => handleChange(index, 'email', e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Phone"
                type="tel"
                value={member.phone}
                onChange={(e) => handleChange(index, 'phone', e.target.value)}
              />
              <select
                style={styles.input}
                value={member.role}
                onChange={(e) => handleChange(index, 'role', e.target.value)}
              >
                <option value="TC">Transaction Coordinator</option>
                <option value="Agent">Agent</option>
                <option value="Admin">Admin</option>
                <option value="Assistant">Assistant</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <button style={styles.addBtn} onClick={addRow}>
        + Add Another Team Member
      </button>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttonRow}>
        <button style={styles.skipBtn} onClick={onSkip}>
          Skip for now
        </button>
        <button style={styles.nextBtn} onClick={handleSubmit}>
          Save & Continue
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
    padding: '32px 24px',
    maxWidth: 600,
    margin: '0 auto',
  },
  heading: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 700,
    fontSize: 26,
    color: '#071D39',
    margin: '0 0 12px 0',
    textAlign: 'center',
  },
  subtext: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 400,
    fontSize: 15,
    color: '#516469',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  existingBox: {
    backgroundColor: '#F0F7E8',
    borderRadius: 8,
    padding: '12px 16px',
    width: '100%',
    marginBottom: 20,
  },
  existingLabel: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#071D39',
    margin: '0 0 8px 0',
  },
  existingChip: {
    display: 'inline-block',
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    border: '1px solid #89A8B1',
    borderRadius: 16,
    padding: '4px 12px',
    marginRight: 8,
    marginBottom: 4,
    color: '#071D39',
  },
  membersList: {
    width: '100%',
    marginBottom: 12,
  },
  memberRow: {
    backgroundColor: '#FAFBFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: '16px',
    marginBottom: 12,
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: '#071D39',
  },
  removeBtn: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 14,
    color: '#89A8B1',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 8px',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  input: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 14,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #89A8B1',
    color: '#071D39',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  addBtn: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: '#75BB2E',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginBottom: 20,
    padding: '8px 0',
  },
  error: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 13,
    color: '#E53E3E',
    margin: '0 0 12px 0',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 16,
    marginTop: 8,
  },
  skipBtn: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    color: '#89A8B1',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '12px 24px',
  },
  nextBtn: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    backgroundColor: '#75BB2E',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '14px 40px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

export default StepTeamSetup;