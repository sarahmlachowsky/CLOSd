import React from 'react';
import { Home, Plus, Users, Edit2, Archive, DollarSign, Shield, HelpCircle } from 'lucide-react';

const Sidebar = ({ projects, onSelectProject, onPipeline, onDashboard, onArchive, onNewProject, onTeamSettings, onMyProfile, onHelpSupport, onSuperAdmin, currentView, selectedProjectId, onLogout, getDealTitle, isAdmin, isSuperAdmin }) => {
  return (
    <div className="w-64 border-r flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#89A8B1' }}>
      <div className="p-4 border-b flex items-center justify-center" style={{ backgroundColor: '#071D39', borderColor: '#071D39' }}>
        <div className="text-center w-full">
          <img 
            src="/closd-logo-dark-bg.png" 
            alt="CLOSD Logo" 
            className="h-16 w-auto mx-auto object-contain"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <button
          onClick={onPipeline}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{
            backgroundColor: currentView === 'pipeline' ? '#89A8B1' : 'transparent',
            color: currentView === 'pipeline' ? '#071D39' : '#516469'
          }}
        >
          <DollarSign className="w-5 h-5" />
          Sales Pipeline
        </button>
        <button
          onClick={onDashboard}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{
            backgroundColor: currentView === 'dashboard' ? '#89A8B1' : 'transparent',
            color: currentView === 'dashboard' ? '#071D39' : '#516469'
          }}
        >
          <Home className="w-5 h-5" />
          Tasks
        </button>
        {isAdmin ? (
          <button
            onClick={onTeamSettings}
            className="w-full text-left p-4 flex items-center gap-2"
            style={{ color: '#516469' }}
          >
            <Users className="w-5 h-5" />
            Team Settings
          </button>
        ) : null}
        <button
          onClick={onMyProfile}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{
            backgroundColor: currentView === 'myProfile' ? '#89A8B1' : 'transparent',
            color: currentView === 'myProfile' ? '#071D39' : '#516469'
          }}
        >
          <Edit2 className="w-5 h-5" />
          My Profile
        </button>

        {/* Help / Support button — visible to all users */}
        <button
          onClick={onHelpSupport}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{
            backgroundColor: currentView === 'helpSupport' ? '#89A8B1' : 'transparent',
            color: currentView === 'helpSupport' ? '#071D39' : '#516469'
          }}
        >
          <HelpCircle className="w-5 h-5" />
          Help & Support
        </button>

        {/* SuperAdmin Dashboard — only visible to superAdmins */}
        {isSuperAdmin && (
          <button
            onClick={onSuperAdmin}
            className="w-full text-left p-4 flex items-center gap-2"
            style={{
              backgroundColor: currentView === 'superAdmin' ? '#89A8B1' : 'transparent',
              color: currentView === 'superAdmin' ? '#071D39' : '#E53E3E',
              fontWeight: '600',
            }}
          >
            <Shield className="w-5 h-5" />
            SuperAdmin
          </button>
        )}

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
              style={{ color: '#FFFFFF', backgroundColor: '#75BB2E' }}
            >
              <Plus className="w-5 h-5" />
              New Deal
            </button>
          ) : (
            <div
              className="w-full p-3 rounded font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{ color: '#FFFFFF', backgroundColor: '#75BB2E' }}
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
