import React from 'react';
import Sidebar from '../layout/Sidebar';
import NewProjectModal from '../tasks/NewProjectModal';
import TeamMemberModal from '../tasks/TeamMemberModal';
import EditProfileModal from '../tasks/EditProfileModal';
import DeleteConfirmModal from '../tasks/DeleteConfirmModal';

const ArchiveView = ({
  activeProjects, archivedProjects, teamMembers, currentView,
  onSelectProject, onPipeline, onDashboard, onArchive, onNewProject,
  onTeamSettings, onMyProfile, onLogout, getDealTitle, isAdmin,
  unarchiveProject, onDeleteDeal,
  showNewProjectModal, onCloseNewProject, createProject,
  showTeamModal, onCloseTeamModal, addTeamMember, removeTeamMember, onEditTeamMember,
  showDeleteModal, dealToDelete, onConfirmDelete, onCancelDelete,
  showEditProfileModal, editProfileMember, editProfileMode,
  onCloseEditProfile, onSaveEditProfile,
}) => {
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Sidebar
        projects={activeProjects}
        onSelectProject={onSelectProject}
        onPipeline={onPipeline}
        onDashboard={onDashboard}
        onArchive={onArchive}
        onNewProject={onNewProject}
        onTeamSettings={onTeamSettings}
        onMyProfile={onMyProfile}
        onLogout={onLogout}
        currentView={currentView}
        getDealTitle={getDealTitle}
        isAdmin={isAdmin}
      />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#071D39' }}>Deal Archive</h1>
        {archivedProjects.length === 0 ? (
          <p className="text-gray-500">No archived deals</p>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            {archivedProjects.map((project) => (
              <div key={project.id} className="p-4 rounded-lg border-2 w-full"
                style={{ borderColor: '#89A8B1', backgroundColor: '#F5F5F5' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#071D39' }}>
                      {project.propertyAddress}
                    </h3>
                    <p className="text-sm mb-1" style={{ color: '#516469' }}>Client: {project.clientName}</p>
                    <p className="text-sm mb-3" style={{ color: '#516469' }}>Type: {project.type}</p>
                  </div>
                  <button
                    onClick={() => onDeleteDeal(project)}
                    className="px-3 py-1 rounded font-semibold text-sm"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => unarchiveProject(project.id)}
                  className="px-4 py-2 rounded font-semibold text-sm"
                  style={{ backgroundColor: '#516469', color: '#FFFFFF' }}>
                  Restore to Active
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {showNewProjectModal && (
        <NewProjectModal onClose={onCloseNewProject} onSave={createProject} />
      )}
      {showTeamModal && (
        <TeamMemberModal
          onClose={onCloseTeamModal} onAdd={addTeamMember}
          onRemove={removeTeamMember} onEdit={onEditTeamMember}
          teamMembers={teamMembers} isAdmin={isAdmin}
        />
      )}
      {showDeleteModal && dealToDelete && (
        <DeleteConfirmModal
          projectAddress={dealToDelete.propertyAddress}
          onConfirm={onConfirmDelete} onCancel={onCancelDelete}
        />
      )}
      {showEditProfileModal && editProfileMember && (
        <EditProfileModal
          member={editProfileMember} mode={editProfileMode}
          isAdmin={isAdmin} onClose={onCloseEditProfile} onSave={onSaveEditProfile}
        />
      )}
    </div>
  );
};

export default ArchiveView;
