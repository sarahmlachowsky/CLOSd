import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Clock, User } from 'lucide-react';

const themeOrder = [
  "New Lead", "Lead", "Document Prep", "Listing Prep", "MLS", "Active",
  "Active Showing", "Offer Prep",
  "Under Contract", "Pre-close", "Pre-Close", "Closed"
];

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
};

const getUserColor = (name) => {
  if (!name) return '#516469';
  const colors = ['#75BB2E', '#75BB2E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444', '#6366F1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const StatusIcon = ({ status }) => {
  if (status === 'complete') {
    return (
      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#75BB2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={12} color="white" />
      </div>
    );
  }
  if (status === 'in-progress') {
    return (
      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Clock size={12} color="white" />
      </div>
    );
  }
  return <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #CBD5E1', backgroundColor: 'white' }} />;
};

const ProgressBar = ({ completed, total }) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
      <div style={{ flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: pct === 100 ? '#75BB2E' : pct > 50 ? '#75BB2E' : '#89A8B1',
          borderRadius: 4,
          transition: 'width 0.4s ease'
        }} />
      </div>
      <span style={{ fontSize: 13, color: '#516469', fontWeight: 600, whiteSpace: 'nowrap' }}>{completed}/{total}</span>
    </div>
  );
};

const ThemeSection = ({ theme, groupNum, tasks, isOpen, onToggle, onTaskClick, isTaskUrgent }) => {
  const completed = tasks.filter(t => t.status === 'complete').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const total = tasks.length;
  const allDone = completed === total && total > 0;

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '14px 20px',
          backgroundColor: isOpen ? '#071D39' : allDone ? '#F0FDF4' : '#FFFFFF',
          border: '1px solid',
          borderColor: isOpen ? '#071D39' : allDone ? '#BBF7D0' : '#E2E8F0',
          borderRadius: isOpen ? '10px 10px 0 0' : 10,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          gap: 14
        }}
      >
        <div style={{ color: isOpen ? '#89A8B1' : '#516469', display: 'flex', alignItems: 'center' }}>
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>

        <div style={{
          width: 28, height: 28, borderRadius: 6,
          backgroundColor: isOpen ? '#89A8B1' : allDone ? '#75BB2E' : '#F1F5F9',
          color: isOpen ? '#FFFFFF' : allDone ? '#FFFFFF' : '#516469',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700
        }}>
          {groupNum}
        </div>

        <span style={{
          fontWeight: 700,
          fontSize: 15,
          color: isOpen ? '#FFFFFF' : '#071D39',
          flex: 1,
          textAlign: 'left',
          letterSpacing: '-0.01em'
        }}>
          {theme}
        </span>

        {inProgress > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 12,
            backgroundColor: isOpen ? 'rgba(245,158,11,0.2)' : '#FEF3C7',
            color: '#92400E'
          }}>
            {inProgress} in progress
          </span>
        )}

        <ProgressBar completed={completed} total={total} />
      </button>

      {isOpen && (
        <div style={{
          border: '1px solid #E2E8F0',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
          backgroundColor: '#FAFBFC'
        }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr 100px 90px 90px',
            padding: '8px 20px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC'
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}></span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
          </div>

          {tasks.map((task, i) => {
            const urgent = isTaskUrgent ? isTaskUrgent(task) : false;
            return (
              <div
                key={task.id || i}
                onClick={() => onTaskClick(task)}
                className="accordion-task-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr 100px 90px 90px',
                  padding: '12px 20px',
                  borderBottom: i < tasks.length - 1 ? '1px solid #F1F5F9' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: task.status === 'complete' ? '#FAFFF9' : urgent ? '#FEF2F2' : 'transparent',
                  alignItems: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = task.status === 'complete' ? '#FAFFF9' : urgent ? '#FEF2F2' : 'transparent'; }}
              >
                <StatusIcon status={task.status} />

                <div style={{ paddingRight: 12 }}>
                  <span style={{
                    fontSize: 14,
                    color: task.status === 'complete' ? '#94A3B8' : '#1E293B',
                    textDecoration: task.status === 'complete' ? 'line-through' : 'none',
                    fontWeight: task.status === 'in-progress' ? 600 : 400
                  }}>
                    {task.name}
                  </span>
                  {urgent && task.status !== 'complete' && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '1px 6px', borderRadius: 4,
                      backgroundColor: '#FEE2E2', color: '#DC2626',
                      marginLeft: 8
                    }}>
                      OVERDUE
                    </span>
                  )}
                </div>

                <div>
                  {task.assignedTo ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      backgroundColor: getUserColor(task.assignedTo),
                      color: 'white', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} title={task.assignedTo}>
                      {getInitials(task.assignedTo)}
                    </div>
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '2px dashed #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <User size={12} color="#CBD5E1" />
                    </div>
                  )}
                </div>

                <span style={{ fontSize: 13, color: task.dueDate ? '#516469' : '#CBD5E1' }}>
                  {task.dueDate || '—'}
                </span>

                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 8px', borderRadius: 6,
                  backgroundColor: task.status === 'complete' ? '#DCFCE7' : task.status === 'in-progress' ? '#FEF3C7' : '#F1F5F9',
                  color: task.status === 'complete' ? '#166534' : task.status === 'in-progress' ? '#92400E' : '#64748B',
                  textAlign: 'center',
                  display: 'inline-block'
                }}>
                  {task.status === 'complete' ? 'Done' : task.status === 'in-progress' ? 'Active' : 'To Do'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AccordionBoard = ({ project, onTaskClick, getTaskColor, isTaskUrgent }) => {
  // Group tasks by theme, sorted in correct order
  const themes = [...new Set(project.tasks.map(t => t.theme))].sort((a, b) => {
    const idxA = themeOrder.indexOf(a);
    const idxB = themeOrder.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  // Find the first theme that has incomplete tasks — open that by default
  const firstIncomplete = themes.find(theme =>
    project.tasks.filter(t => t.theme === theme).some(t => t.status !== 'complete')
  );
  const [openSections, setOpenSections] = useState(new Set(firstIncomplete ? [firstIncomplete] : []));

  const toggle = (theme) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(theme)) next.delete(theme);
      else next.add(theme);
      return next;
    });
  };

  // Overall progress
  const totalTasks = project.tasks.length;
  const totalComplete = project.tasks.filter(t => t.status === 'complete').length;
  const overallPct = totalTasks === 0 ? 0 : Math.round((totalComplete / totalTasks) * 100);

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Overall progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 4px 20px',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: 16
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#071D39' }}>Overall Progress</span>
        <div style={{ flex: 1, height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${overallPct}%`,
            backgroundColor: overallPct === 100 ? '#75BB2E' : overallPct > 50 ? '#75BB2E' : '#89A8B1',
            borderRadius: 5,
            transition: 'width 0.6s ease'
          }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#071D39', whiteSpace: 'nowrap' }}>
          {totalComplete}/{totalTasks} ({overallPct}%)
        </span>
      </div>

      {/* Accordion sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {themes.map((theme, idx) => {
          const tasksForTheme = project.tasks.filter(t => t.theme === theme);
          return (
            <ThemeSection
              key={theme}
              theme={theme}
              groupNum={idx + 1}
              tasks={tasksForTheme}
              isOpen={openSections.has(theme)}
              onToggle={() => toggle(theme)}
              onTaskClick={onTaskClick}
              isTaskUrgent={isTaskUrgent}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AccordionBoard;
