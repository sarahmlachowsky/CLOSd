import React from 'react';
import { Home, AlertCircle, Calendar } from 'lucide-react';
import Sidebar from '../layout/Sidebar';
import DashboardCard from './DashboardCard';
import MyTasksModal from './MyTasksModal';
import NewProjectModal from '../tasks/NewProjectModal';
import TeamMemberModal from '../tasks/TeamMemberModal';
import EditProfileModal from '../tasks/EditProfileModal';
import TaskDetailModal from '../tasks/TaskDetailModal';

const DashboardView = ({
  user, activeProjects, teamMembers, currentView,
  onSelectProject, onPipeline, onDashboard, onArchive, onNewProject,
  onTeamSettings, onMyProfile, onSuperAdmin, onLogout, getDealTitle, isAdmin, isSuperAdmin, orgId,
  getTaskColor, isTaskUrgent,
  getMyTasks, getDueSoonTasks, getOverdueTasks,
  getMyTasksGroupedByDeal, getDueSoonTasksGroupedByDeal, getOverdueTasksGroupedByDeal,
  showNewProjectModal, onCloseNewProject, createProject,
  showTeamModal, onCloseTeamModal, addTeamMember, removeTeamMember, onEditTeamMember,
  showEditProfileModal, editProfileMember, editProfileMode,
  onCloseEditProfile, onSaveEditProfile,
  showMyTasksModal, myTasksModalDeal, myTasksModalType,
  onCloseMyTasksModal, onMyTasksDealClick, onMyTasksTaskClick,
  showTaskDetailModal, taskDetailTask, taskDetailProject,
  onCloseTaskDetail, onTaskDetailUpdate,
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
        onSuperAdmin={onSuperAdmin}
        onLogout={onLogout}
        currentView={currentView}
        getDealTitle={getDealTitle}
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        user={user}
        orgId={orgId}
      />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#071D39' }}>
          Hello {user.firstName}, let's get these deals CLOSd!
        </h1>
        <div className="flex flex-col gap-6 mt-8">
          <DashboardCard
            title="Current Deals" count={activeProjects.length}
            icon={<Home className="w-6 h-6" />} color="blue"
            projects={activeProjects} onSelectProject={onSelectProject}
            getDealTitle={getDealTitle}
          />
          <DashboardCard
            title="Tasks Assigned To Me" count={getMyTasks().length}
            icon={<AlertCircle className="w-6 h-6" />} color="green"
            groupedDeals={getMyTasksGroupedByDeal()}
            onSelectGroupedDeal={(deal) => onMyTasksDealClick(deal, 'assigned')}
            bgTint="#EFF6FF"
          />
          <DashboardCard
            title="Due Within 72 Hours" count={getDueSoonTasks().length}
            icon={<Calendar className="w-6 h-6" />} color="yellow"
            groupedDeals={getDueSoonTasksGroupedByDeal()}
            onSelectGroupedDeal={(deal) => onMyTasksDealClick(deal, 'dueSoon')}
            bgTint="#FFFBEB"
          />
          <DashboardCard
            title="Overdue" count={getOverdueTasks().length}
            icon={<AlertCircle className="w-6 h-6" />} color="red"
            groupedDeals={getOverdueTasksGroupedByDeal()}
            onSelectGroupedDeal={(deal) => onMyTasksDealClick(deal, 'overdue')}
            bgTint="#FEF2F2"
          />
        </div>
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
      {showEditProfileModal && editProfileMember && (
        <EditProfileModal
          member={editProfileMember} mode={editProfileMode}
          isAdmin={isAdmin} onClose={onCloseEditProfile} onSave={onSaveEditProfile}
        />
      )}
      {showMyTasksModal && myTasksModalDeal && (
        <MyTasksModal
          deal={myTasksModalDeal} modalType={myTasksModalType}
          onClose={onCloseMyTasksModal} onTaskClick={onMyTasksTaskClick}
          getTaskColor={getTaskColor} isTaskUrgent={isTaskUrgent}
        />
      )}
      {showTaskDetailModal && taskDetailTask && (
        <TaskDetailModal
          task={taskDetailTask} project={taskDetailProject}
          teamMembers={teamMembers}
          onClose={onCloseTaskDetail} onUpdate={onTaskDetailUpdate}
        />
      )}
    </div>
  );
};

export default DashboardView;
