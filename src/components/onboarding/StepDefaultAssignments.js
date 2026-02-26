import React, { useState, useEffect } from 'react';
import SELLER_TEMPLATE from '../../templates/sellerTemplate';
import BUYER_TEMPLATE from '../../templates/buyerTemplate';

const StepDefaultAssignments = ({
  dealType,
  teamMembers = [],
  existingDefaults = [],
  onSaveDefaults,
  onNext,
  onSkip,
}) => {
  const [assignments, setAssignments] = useState({});

  const template = dealType === 'Seller' ? SELLER_TEMPLATE : BUYER_TEMPLATE;

  // Template is already grouped by theme — each item has .theme and .activities
  const grouped = {};
  template.forEach((themeGroup) => {
    const theme = themeGroup.theme || 'Other';
    if (!grouped[theme]) grouped[theme] = [];
    themeGroup.activities.forEach((activity) => {
      grouped[theme].push(activity);
    });
  });

  // Count total tasks
  const totalCount = template.reduce((sum, g) => sum + g.activities.length, 0);

  // Pre-fill from existing defaults
  useEffect(() => {
    const prefilled = {};
    existingDefaults
      .filter((d) => d.dealType === dealType)
      .forEach((d) => {
        prefilled[d.taskName] = d.assignedTo || '';
      });
    setAssignments(prefilled);
  }, [existingDefaults, dealType]);

  const handleAssign = (taskName, memberName) => {
    setAssignments((prev) => ({ ...prev, [taskName]: memberName }));
  };

  const handleSave = () => {
    // Build array of assignment objects
    const results = Object.entries(assignments)
      .filter(([_, name]) => name && name !== '')
      .map(([taskName, assignedTo]) => {
        const member = teamMembers.find((m) => m.name === assignedTo);
        return {
          dealType,
          taskName,
          assignedTo,
          assignedUid: member?.uid || '',
        };
      });

    onSaveDefaults(results);
    onNext();
  };

  const assignedCount = Object.values(assignments).filter(
    (v) => v && v !== ''
  ).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        Default Assignments — {dealType} Deals
      </h1>
      <p style={styles.subtext}>
        For <strong>{dealType}</strong> deals, who usually handles these tasks?
        These defaults auto-apply to every new {dealType} deal you create. You
        can always change them per-deal later.
      </p>

      <div style={styles.progressInfo}>
        <span style={styles.progressText}>
          {assignedCount} of {totalCount} tasks assigned
        </span>
        <div style={styles.progressBarBg}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${totalCount > 0 ? (assignedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.themeList}>
        {Object.entries(grouped).map(([theme, tasks]) => (
          <div key={theme} style={styles.themeBlock}>
            <h3 style={styles.themeHeading}>{theme}</h3>
            {tasks.map((task) => (
              <div key={task.name} style={styles.taskRow}>
                <span style={styles.taskName}>{task.name}</span>
                <select
                  style={styles.dropdown}
                  value={assignments[task.name] || ''}
                  onChange={(e) => handleAssign(task.name, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m, i) => (
                    <option key={i} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.buttonRow}>
        <button style={styles.skipBtn} onClick={onSkip}>
          Skip for now
        </button>
        <button style={styles.nextBtn} onClick={handleSave}>
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
    padding: '32px 24px',
    maxWidth: 640,
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
    margin: '0 0 20px 0',
  },
  progressInfo: {
    marginBottom: 24,
  },
  progressText: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#516469',
    display: 'block',
    marginBottom: 6,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#75BB2E',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  themeList: {
    width: '100%',
    marginBottom: 24,
    maxHeight: 400,
    overflowY: 'auto',
  },
  themeBlock: {
    marginBottom: 20,
  },
  themeHeading: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: '#071D39',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0',
    paddingBottom: 6,
    borderBottom: '2px solid #75BB2E',
  },
  taskRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
    marginBottom: 6,
    border: '1px solid #E2E8F0',
  },
  taskName: {
    fontFamily: "'AvenirNext', sans-serif",
    fontWeight: 400,
    fontSize: 14,
    color: '#071D39',
    flex: 1,
    marginRight: 12,
  },
  dropdown: {
    fontFamily: "'AvenirNext', sans-serif",
    fontSize: 13,
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #89A8B1',
    color: '#071D39',
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
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

export default StepDefaultAssignments;