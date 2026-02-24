import React from 'react';
import { Plus, Home, Archive, Users, Edit2 } from 'lucide-react';

const Sidebar = ({ projects, onSelectProject, onDashboard, onArchive, onNewProject, onManageTeam, onMyProfile, currentView, selectedProjectId, onLogout, getDealTitle, isAdmin }) => {
  return (
    <div className="w-64 border-r flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#89A8B1' }}>
      <div className="p-4 border-b flex items-center justify-center" style={{ backgroundColor: '#071D39', borderColor: '#071D39' }}>
        <div className="text-center w-full">
          <img 
            src="/closd-logo.png" 
            alt="CLOSD Logo" 
            className="h-16 w-auto mx-auto object-contain"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <button
          onClick={onDashboard}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ 
            backgroundColor: currentView === 'dashboard' ? '#89A8B1' : 'transparent',
            color: currentView === 'dashboard' ? '#071D39' : '#516469'
          }}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={onManageTeam}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ color: '#516469' }}
        >
          <Users className="w-5 h-5" />
          Manage Team
        </button>
        <button
          onClick={onMyProfile}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ color: '#516469' }}
        >
          <Edit2 className="w-5 h-5" />
          My Profile
        </button>
        <div className="p-4 text-sm font-semibold" style={{ color: '#516469' }}>ACTIVE DEALS</div>
        
        {/* Sellers Section */}
        {projects.filter(p => p.type === 'Seller').length > 0 && (
          <>
            <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#89A8B1' }}>
              Sellers
            </div>
            {projects.filter(p => p.type === 'Seller').map((project) => (
              <div key={project.id} className="mx-3 mb-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="w-full text-left px-3 py-1 rounded border-l-4"
                  style={{
                    borderLeftColor: selectedProjectId === project.id ? '#516469' : '#89A8B1',
                    backgroundColor: selectedProjectId === project.id ? '#89A8B1' : '#F5F5F5',
                    border: '2px solid #89A8B1'
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.propertyAddress}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.clientName}</div>
                </button>
              </div>
            ))}
          </>
        )}
        
        {/* Buyers Section */}
        {projects.filter(p => p.type === 'Buyer').length > 0 && (
          <>
            <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: '#89A8B1' }}>
              Buyers
            </div>
            {projects.filter(p => p.type === 'Buyer').map((project) => (
              <div key={project.id} className="mx-3 mb-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="w-full text-left px-3 py-1 rounded border-l-4"
                  style={{
                    borderLeftColor: selectedProjectId === project.id ? '#516469' : '#89A8B1',
                    backgroundColor: selectedProjectId === project.id ? '#89A8B1' : '#F5F5F5',
                    border: '2px solid #89A8B1'
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.clientName}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.propertyAddress || 'No property yet'}</div>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      <button
        onClick={onArchive}
        className="mx-4 mb-2 p-3 rounded font-semibold flex items-center justify-center gap-2"
        style={{ 
          backgroundColor: currentView === 'archive' ? '#89A8B1' : 'transparent',
          color: currentView === 'archive' ? '#071D39' : '#516469',
          border: '2px solid #89A8B1'
        }}
      >
        <Archive className="w-5 h-5" />
        Deal Archive
      </button>
      <div className="mx-3 mb-3">
          {isAdmin ? (
            <button
              onClick={onNewProject}
              className="w-full p-3 rounded font-semibold flex items-center justify-center gap-2"
              style={{ color: '#FFFFFF', backgroundColor: '#071D39' }}
            >
              <Plus className="w-5 h-5" />
              New Deal
            </button>
          ) : (
            <div
              className="w-full p-3 rounded font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{ color: '#FFFFFF', backgroundColor: '#071D39' }}
              title="Only Admins can create new deals"
            >
              <Plus className="w-5 h-5" />
              New Deal
            </div>
          )}
        </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="mx-4 mb-4 p-3 rounded font-semibold border-2"
          style={{ borderColor: '#516469', color: '#516469', backgroundColor: 'transparent' }}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Sidebar;