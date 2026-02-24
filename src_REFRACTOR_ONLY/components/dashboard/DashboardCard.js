import React from 'react';

const DashboardCard = ({ title, count, icon, color, tasks, projects, onSelectProject, allProjects, groupedDeals, onSelectGroupedDeal, bgTint, getDealTitle }) => {
  const colors = {
    blue: { bg: '#89A8B1', text: '#071D39' },
    yellow: { bg: '#FFC107', text: '#000000' },
    red: { bg: '#EF4444', text: '#FFFFFF' },
    green: { bg: '#10B981', text: '#FFFFFF' }
  };

  const handleProjectClick = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const handleTaskClick = (task) => {
    if (onSelectProject && allProjects) {
      const project = allProjects.find(p => p.id === task.projectId);
      if (project) {
        onSelectProject(project);
      }
    }
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const handleGroupedDealClick = (deal) => {
    if (onSelectGroupedDeal) {
      onSelectGroupedDeal(deal);
    }
  };

  return (
    <div className="p-6 rounded-lg shadow" style={{ backgroundColor: bgTint || '#FFFFFF', border: '1px solid #89A8B1' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#071D39' }}>{title}</h3>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors[color].bg, color: colors[color].text }}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold mb-4" style={{ color: '#516469' }}>{count}</div>
      {projects && projects.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {projects.map((project, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleProjectClick(project)}
              onKeyDown={(e) => handleKeyDown(e, () => handleProjectClick(project))}
              tabIndex={0}
              role="button"
              aria-label={`Open deal: ${project.propertyAddress}`}
            >
              <div className="font-medium" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.propertyAddress}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.type === 'Buyer' ? (project.propertyAddress || 'No property yet') : project.clientName}</div>
            </div>
          ))}
        </div>
      )}
      {groupedDeals && groupedDeals.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {groupedDeals.map((deal, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleGroupedDealClick(deal)}
              onKeyDown={(e) => handleKeyDown(e, () => handleGroupedDealClick(deal))}
              tabIndex={0}
              role="button"
              aria-label={`View ${deal.taskCount} tasks in ${deal.projectName}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium" style={{ color: '#071D39' }}>{deal.projectType === 'Buyer' ? (deal.projectClientName || 'New Buyer Deal') : deal.projectName}</div>
                <div className="text-xs" style={{ color: '#516469' }}>{deal.projectType === 'Buyer' ? (deal.projectName || 'No property yet') : deal.projectClientName}</div>
              </div>
              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                {deal.taskCount} {deal.taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          ))}
        </div>
      )}
      {tasks && tasks.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {tasks.map((task, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleTaskClick(task)}
              onKeyDown={(e) => handleKeyDown(e, () => handleTaskClick(task))}
              tabIndex={0}
              role="button"
              aria-label={`Open task: ${task.name} in ${task.projectName}`}
            >
              <div className="font-medium truncate" style={{ color: '#071D39' }}>{task.name}</div>
              <div className="text-xs" style={{ color: '#516469' }}>{task.projectName}</div>
              {task.dueDate && <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;