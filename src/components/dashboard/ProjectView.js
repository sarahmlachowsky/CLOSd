import React from 'react';
import { X, Edit2, Archive } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import AccordionBoard from '../tasks/AccordionBoard';
import TaskDetailPanel from '../tasks/TaskDetailPanel';
import DealFinancials from '../tasks/DealFinancials';
import NewProjectModal from '../tasks/NewProjectModal';
import TeamMemberModal from '../tasks/TeamMemberModal';
import EditProfileModal from '../tasks/EditProfileModal';
import EditProjectModal from '../tasks/EditProjectModal';
import ArchiveConfirmModal from '../tasks/ArchiveConfirmModal';
import DeleteConfirmModal from '../tasks/DeleteConfirmModal';

const ProjectView = ({
  activeProjects, selectedProject, selectedTask, teamMembers, currentView,
  onSelectProject, onPipeline, onDashboard, onArchive, onNewProject,
  onTeamSettings, onMyProfile, onLogout, getDealTitle, isAdmin,
  getTaskColor, isTaskUrgent, onTaskClick, updateProject,
  onCloseTask, onUpdateTask,
  showNewProjectModal, onCloseNewProject, createProject,
  showTeamModal, onCloseTeamModal, addTeamMember, removeTeamMember, onEditTeamMember,
  showEditProfileModal, editProfileMember, editProfileMode,
  onCloseEditProfile, onSaveEditProfile,
  showArchiveModal, onOpenArchiveModal, onArchiveProject, onCloseArchiveModal,
  showDeleteModal, dealToDelete, onDeleteDeal, onConfirmDelete, onCancelDelete,
  showEditProjectModal, onOpenEditProject, onCloseEditProject, onSaveEditProject,
  isSuperAdmin, onSuperAdmin, onHelpSupport, user, orgId,
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
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
        isSuperAdmin={isSuperAdmin}
        onSuperAdmin={onSuperAdmin}
        onHelpSupport={onHelpSupport}
        user={user}
        orgId={orgId}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{getDealTitle(selectedProject)}</h2>
              <button onClick={onOpenEditProject}
                className="p-2 hover:bg-gray-100 rounded" title="Edit deal details">
                <Edit2 className="w-5 h-5" style={{ color: '#516469' }} />
              </button>
            </div>
            {selectedProject?.status === 'archived' ? (
              <button
                onClick={() => onDeleteDeal(selectedProject)}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5' }}>
                <X className="w-4 h-4" /> Delete Deal
              </button>
            ) : (
              <button
                onClick={onOpenArchiveModal}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '2px solid #FCD34D' }}>
                <Archive className="w-4 h-4" /> Archive Deal
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Client:</span>{' '}
              <span className="font-medium">{selectedProject?.clientName}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>{' '}
              <span className="font-medium">{selectedProject?.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>{' '}
              <span className="font-medium">{selectedProject?.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium">{selectedProject?.email || 'Not provided'}</span>
            </div>
            {selectedProject?.contractDate && (
              <p className="text-sm">
                <span className="text-gray-500">Under Contract Date:</span>{' '}
                <span className="font-medium">{selectedProject?.contractDate}</span>
              </p>
            )}
            <DealFinancials selectedProject={selectedProject} updateProject={updateProject} />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <AccordionBoard
            project={selectedProject}
            onTaskClick={onTaskClick}
            getTaskColor={getTaskColor}
            isTaskUrgent={isTaskUrgent}
          />
        </div>
      </div>
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask} project={selectedProject}
          teamMembers={teamMembers} onClose={onCloseTask} onUpdate={onUpdateTask}
        />
      )}
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
      {showEditProfileModal && editProfileMember && (
        <EditProfileModal
          member={editProfileMember} mode={editProfileMode}
          isAdmin={isAdmin} onClose={onCloseEditProfile} onSave={onSaveEditProfile}
        />
      )}
      {showArchiveModal && (
        <ArchiveConfirmModal
          projectAddress={selectedProject?.propertyAddress}
          onConfirm={onArchiveProject} onCancel={onCloseArchiveModal}
        />
      )}
      {showDeleteModal && dealToDelete && (
        <DeleteConfirmModal
          projectAddress={dealToDelete.propertyAddress}
          onConfirm={onConfirmDelete} onCancel={onCancelDelete}
        />
      )}
      {showEditProjectModal && (
        <EditProjectModal
          project={selectedProject}
          onClose={onCloseEditProject} onSave={onSaveEditProject}
        />
      )}
    </div>
  );
};

export default ProjectView;
