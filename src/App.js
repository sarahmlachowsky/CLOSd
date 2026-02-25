import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import React, { useState, useEffect } from 'react';

import SELLER_TEMPLATE from './templates/sellerTemplate';
import BUYER_TEMPLATE from './templates/buyerTemplate';
import storage from './services/firebaseService';

import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import ArchiveView from './components/dashboard/ArchiveView';
import SalesPipeline from './components/dashboard/SalesPipeline';
import TeamSettings from './components/dashboard/TeamSettings';
import ProjectView from './components/dashboard/ProjectView';
import NewProjectModal from './components/tasks/NewProjectModal';
import EditProfileModal from './components/tasks/EditProfileModal';

const App = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentView, setCurrentView] = useState('pipeline');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [defaultAssignments, setDefaultAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileMember, setEditProfileMember] = useState(null);
  const [editProfileMode, setEditProfileMode] = useState('self');
  const [showMyTasksModal, setShowMyTasksModal] = useState(false);
  const [myTasksModalDeal, setMyTasksModalDeal] = useState(null);
  const [myTasksModalType, setMyTasksModalType] = useState('assigned');
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [taskDetailTask, setTaskDetailTask] = useState(null);
  const [taskDetailProject, setTaskDetailProject] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = storage.get('user');
      const projectsData = storage.get('projects');
      const teamData = storage.get('team');
      if (userData) setUser(JSON.parse(userData.value));
      if (projectsData) {
        const loaded = JSON.parse(projectsData.value);
        setProjects(loaded.map(p => ({ ...p, status: p.status || 'active' })));
      }
      if (teamData) setTeamMembers(JSON.parse(teamData.value));
      const savedDefaults = storage.get('defaultAssignments');
      if (savedDefaults) setDefaultAssignments(JSON.parse(savedDefaults.value));
    } catch (error) { console.log('Starting fresh'); }
    setLoading(false);
  };

  const saveUser = async (userData) => {
    try {
      storage.set('user', JSON.stringify(userData));
      setUser(userData);
      const teamData = storage.get('team');
      let currentTeam = teamData ? JSON.parse(teamData.value) : [];
      const userExists = currentTeam.some(m => m.email === userData.email);
      if (!userExists) {
        const newMember = {
          id: Date.now().toString(), firstName: userData.firstName,
          lastName: userData.lastName || '', email: userData.email,
          phone: '', role: currentTeam.length === 0 ? 'admin' : 'member'
        };
        currentTeam = [...currentTeam, newMember];
        storage.set('team', JSON.stringify(currentTeam));
      }
      setTeamMembers(currentTeam);
    } catch (error) { setUser(userData); }
  };

  const saveProjects = async (data) => {
    try { storage.set('projects', JSON.stringify(data)); setProjects(data); }
    catch (e) { console.error('Error saving'); }
  };

  const saveTeamMembers = async (data) => {
    try { storage.set('team', JSON.stringify(data)); setTeamMembers(data); }
    catch (e) { console.error('Error saving team'); }
  };

  const saveDefaultAssignments = (assignments) => {
    setDefaultAssignments(assignments);
    storage.set('defaultAssignments', JSON.stringify(assignments));
  };

  const addTeamMember = async (memberData) => {
    const newMember = {
      id: Date.now().toString(), ...memberData,
      role: memberData.role || 'member', notificationPreference: 'email'
    };
    await saveTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = async (memberId) => {
    await saveTeamMembers(teamMembers.filter(m => m.id !== memberId));
    const newAssignments = { ...defaultAssignments };
    Object.keys(newAssignments).forEach(taskId => {
      if (newAssignments[taskId] === memberId) delete newAssignments[taskId];
    });
    saveDefaultAssignments(newAssignments);
  };

  const updateTeamMember = async (memberId, updates) => {
    const updated = teamMembers.map(m => m.id === memberId ? { ...m, ...updates } : m);
    await saveTeamMembers(updated);
    const updatedMember = updated.find(m => m.id === memberId);
    if (user && updatedMember && user.email === updatedMember.email) {
      const newUser = { ...user, firstName: updatedMember.firstName, lastName: updatedMember.lastName };
      setUser(newUser);
      storage.set('user', JSON.stringify(newUser));
    }
  };

  const getDealTitle = (deal) => {
    if (!deal) return '';
    return deal.type === 'Buyer' ? (deal.clientName || 'New Buyer Deal') : (deal.propertyAddress || 'New Seller Deal');
  };

  const isAdmin = () => {
    if (!user || teamMembers.length === 0) return true;
    const currentMember = teamMembers.find(m => m.email === user.email);
    return currentMember?.role === 'admin' || teamMembers[0]?.email === user.email;
  };

  const getCurrentUserMember = () => teamMembers.find(m => m.email === user?.email);

  const calculateDueDate = (startDate, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const createProject = async (projectData) => {
    if (!isAdmin()) { alert('Permission denied: Only Admins can create new deals.'); return; }
    const template = projectData.type === 'Buyer' ? BUYER_TEMPLATE : SELLER_TEMPLATE;
    const newProject = {
      id: Date.now().toString(), ...projectData, status: 'active',
      createdAt: new Date().toISOString(),
      tasks: template.flatMap(themeGroup =>
        themeGroup.activities.map((activity, idx) => {
          const taskType = projectData.type === 'Buyer' ? 'buyer' : 'seller';
          const taskKey = `${taskType}-${themeGroup.theme}-${activity.name}`;
          const defaultAssigneeId = defaultAssignments[taskKey];
          const defaultAssignee = defaultAssigneeId ? teamMembers.find(m => m.id === defaultAssigneeId) : null;
          return {
            id: `${themeGroup.group}-${idx}`, theme: themeGroup.theme,
            name: activity.name, notes: activity.notes, status: 'not-started',
            dueDate: projectData.contractDate && activity.daysOffset
              ? calculateDueDate(projectData.contractDate, activity.daysOffset) : null,
            userNotes: '',
            assignedTo: defaultAssignee ? `${defaultAssignee.firstName} ${defaultAssignee.lastName}` : ''
          };
        })
      )
    };
    await saveProjects([...projects, newProject]);
    setShowNewProjectModal(false);
    setSelectedProject(newProject);
    setCurrentView('project');
  };

  const updateProject = async (projectId, updates) => {
    const updated = projects.map(p => p.id === projectId ? { ...p, ...updates } : p);
    await saveProjects(updated);
    if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, ...updates });
  };

  const archiveProject = async () => {
    await updateProject(selectedProject.id, { status: 'archived' });
    setShowArchiveModal(false);
    setSelectedProject(null);
    setCurrentView('dashboard');
  };

  const unarchiveProject = async (projectId) => { await updateProject(projectId, { status: 'active' }); };

  const deleteProject = async (projectId = null) => {
    const idToDelete = projectId || selectedProject?.id;
    if (!idToDelete) return;
    await saveProjects(projects.filter(p => p.id !== idToDelete));
    setShowDeleteModal(false); setDealToDelete(null);
    if (selectedProject?.id === idToDelete) { setSelectedProject(null); setCurrentView('dashboard'); }
  };

  const updateTask = async (projectId, taskId, updates) => {
    const updated = projects.map(p => {
      if (p.id === projectId) return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) };
      return p;
    });
    await saveProjects(updated);
    if (selectedProject?.id === projectId) setSelectedProject(updated.find(p => p.id === projectId));
  };

  const isTaskUrgent = (task) => {
    if (task.status === 'complete') return false;
    if (!task.dueDate) return false;
    const diffDays = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 || diffDays <= 3;
  };

  const getTaskColor = (task) => {
    if (task.status === 'complete') return 'bg-blue-500 text-white';
    if (task.status === 'not-applicable') return 'bg-gray-400 text-white';
    if (task.status === 'in-progress') return 'bg-green-500 text-white';
    return 'bg-white text-gray-700 border border-gray-300';
  };

  const getDueSoonTasks = () => {
    const active = projects.filter(p => p.status === 'active');
    const allTasks = active.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete' || t.status === 'not-applicable') return false;
      const diffDays = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  };

  const getOverdueTasks = () => {
    const active = projects.filter(p => p.status === 'active');
    const allTasks = active.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete' || t.status === 'not-applicable') return false;
      return new Date(t.dueDate) < new Date();
    });
  };

  const getMyTasks = () => {
    const active = projects.filter(p => p.status === 'active');
    const allTasks = active.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    const normalizedUserName = user ? `${user.firstName} ${user.lastName || ''}`.trim().toLowerCase() : '';
    return allTasks.filter(t => {
      if (!t.assignedTo) return false;
      return t.assignedTo.toLowerCase().trim() === normalizedUserName
        && t.status !== 'complete' && t.status !== 'not-applicable';
    });
  };

  const groupTasksByDeal = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.projectId]) {
        grouped[task.projectId] = { projectId: task.projectId, projectName: task.projectName, projectClientName: task.projectClientName, tasks: [], taskCount: 0 };
      }
      grouped[task.projectId].tasks.push(task);
      grouped[task.projectId].taskCount++;
    });
    return Object.values(grouped);
  };

  const getMyTasksGroupedByDeal = () => groupTasksByDeal(getMyTasks());
  const getOverdueTasksGroupedByDeal = () => groupTasksByDeal(getOverdueTasks());
  const getDueSoonTasksGroupedByDeal = () => groupTasksByDeal(getDueSoonTasks());

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error("Logout error:", e); }
    storage.delete("user");
    setUser(null); setCurrentView("pipeline"); setSelectedProject(null); setSelectedTask(null);
  };

  // --- Shared callbacks ---
  const handleSelectProject = (p) => { setSelectedProject(p); setCurrentView('project'); };
  const handleOpenMyProfile = () => {
    const member = getCurrentUserMember();
    if (member) { setEditProfileMember(member); setEditProfileMode('self'); setShowEditProfileModal(true); }
  };
  const handleEditTeamMember = (member) => { setEditProfileMember(member); setEditProfileMode('admin'); setShowEditProfileModal(true); };
  const handleCloseEditProfile = () => { setShowEditProfileModal(false); setEditProfileMember(null); };
  const handleSaveEditProfile = (memberId, updates) => { updateTeamMember(memberId, updates); setShowEditProfileModal(false); setEditProfileMember(null); };

  const handleMyTasksDealClick = (deal, type) => { setMyTasksModalDeal(deal); setMyTasksModalType(type); setShowMyTasksModal(true); };
  const handleCloseMyTasksModal = () => { setShowMyTasksModal(false); setMyTasksModalDeal(null); setMyTasksModalType('assigned'); };
  const handleMyTasksTaskClick = (task) => {
    const project = projects.filter(p => p.status === 'active').find(p => p.id === task.projectId);
    setTaskDetailTask(task); setTaskDetailProject(project); setShowTaskDetailModal(true);
  };
  const handleCloseTaskDetail = () => { setShowTaskDetailModal(false); setTaskDetailTask(null); setTaskDetailProject(null); };
  const handleTaskDetailUpdate = (updates) => {
    updateTask(taskDetailTask.projectId, taskDetailTask.id, updates);
    if (myTasksModalDeal) {
      const updatedTasks = myTasksModalDeal.tasks.map(t => t.id === taskDetailTask.id ? { ...t, ...updates } : t);
      if (updates.status === 'complete') {
        const remaining = updatedTasks.filter(t => t.status !== 'complete');
        if (remaining.length === 0) { setShowMyTasksModal(false); setMyTasksModalDeal(null); setMyTasksModalType('assigned'); }
        else { setMyTasksModalDeal({ ...myTasksModalDeal, tasks: remaining, taskCount: remaining.length }); }
      } else { setMyTasksModalDeal({ ...myTasksModalDeal, tasks: updatedTasks }); }
    }
    setShowTaskDetailModal(false); setTaskDetailTask(null); setTaskDetailProject(null);
  };

  const handleDeleteDeal = (project) => { setDealToDelete(project); setShowDeleteModal(true); };
  const handleConfirmDelete = () => { deleteProject(dealToDelete.id); };
  const handleCancelDelete = () => { setShowDeleteModal(false); setDealToDelete(null); };

  // --- Render ---
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <LoginScreen onLogin={saveUser} />;

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  // Shared sidebar props
  const sidebarProps = {
    projects: activeProjects, onSelectProject: handleSelectProject,
    onPipeline: () => setCurrentView('pipeline'), onDashboard: () => setCurrentView('dashboard'),
    onArchive: () => setCurrentView('archive'), onNewProject: () => setShowNewProjectModal(true),
    onTeamSettings: () => setCurrentView('teamSettings'), onMyProfile: handleOpenMyProfile,
    onLogout: handleLogout, currentView, getDealTitle, isAdmin: isAdmin(),
  };

  if (currentView === 'pipeline') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar {...sidebarProps} />
        <div className="flex-1 overflow-auto">
          <SalesPipeline projects={activeProjects} getDealTitle={getDealTitle} />
        </div>
        {showNewProjectModal && (
          <NewProjectModal onClose={() => setShowNewProjectModal(false)} onSave={createProject} />
        )}
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <DashboardView
        user={user} activeProjects={activeProjects} teamMembers={teamMembers} currentView={currentView}
        {...sidebarProps}
        getTaskColor={getTaskColor} isTaskUrgent={isTaskUrgent}
        getMyTasks={getMyTasks} getDueSoonTasks={getDueSoonTasks} getOverdueTasks={getOverdueTasks}
        getMyTasksGroupedByDeal={getMyTasksGroupedByDeal}
        getDueSoonTasksGroupedByDeal={getDueSoonTasksGroupedByDeal}
        getOverdueTasksGroupedByDeal={getOverdueTasksGroupedByDeal}
        showNewProjectModal={showNewProjectModal}
        onCloseNewProject={() => setShowNewProjectModal(false)} createProject={createProject}
        showTeamModal={showTeamModal}
        onCloseTeamModal={() => setShowTeamModal(false)}
        addTeamMember={addTeamMember} removeTeamMember={removeTeamMember}
        onEditTeamMember={handleEditTeamMember}
        showEditProfileModal={showEditProfileModal} editProfileMember={editProfileMember}
        editProfileMode={editProfileMode}
        onCloseEditProfile={handleCloseEditProfile} onSaveEditProfile={handleSaveEditProfile}
        showMyTasksModal={showMyTasksModal} myTasksModalDeal={myTasksModalDeal}
        myTasksModalType={myTasksModalType}
        onCloseMyTasksModal={handleCloseMyTasksModal} onMyTasksDealClick={handleMyTasksDealClick}
        onMyTasksTaskClick={handleMyTasksTaskClick}
        showTaskDetailModal={showTaskDetailModal} taskDetailTask={taskDetailTask}
        taskDetailProject={taskDetailProject}
        onCloseTaskDetail={handleCloseTaskDetail} onTaskDetailUpdate={handleTaskDetailUpdate}
      />
    );
  }

  if (currentView === 'teamSettings') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar {...sidebarProps} />
        <div className="flex-1 overflow-auto">
          <TeamSettings
            teamMembers={teamMembers} onAddMember={addTeamMember}
            onRemoveMember={removeTeamMember}
            onEditMember={handleEditTeamMember}
            defaultAssignments={defaultAssignments}
            onSaveDefaults={saveDefaultAssignments}
            sellerTemplate={SELLER_TEMPLATE} buyerTemplate={BUYER_TEMPLATE}
            isAdmin={isAdmin()}
          />
        </div>
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember} mode={editProfileMode}
            isAdmin={isAdmin()} onClose={handleCloseEditProfile} onSave={handleSaveEditProfile}
          />
        )}
        {showNewProjectModal && (
          <NewProjectModal onClose={() => setShowNewProjectModal(false)} onSave={createProject} />
        )}
      </div>
    );
  }

  if (currentView === 'archive') {
    return (
      <ArchiveView
        activeProjects={activeProjects} archivedProjects={archivedProjects}
        teamMembers={teamMembers} currentView={currentView}
        {...sidebarProps}
        unarchiveProject={unarchiveProject} onDeleteDeal={handleDeleteDeal}
        showNewProjectModal={showNewProjectModal}
        onCloseNewProject={() => setShowNewProjectModal(false)} createProject={createProject}
        showTeamModal={showTeamModal} onCloseTeamModal={() => setShowTeamModal(false)}
        addTeamMember={addTeamMember} removeTeamMember={removeTeamMember}
        onEditTeamMember={handleEditTeamMember}
        showDeleteModal={showDeleteModal} dealToDelete={dealToDelete}
        onConfirmDelete={handleConfirmDelete} onCancelDelete={handleCancelDelete}
        showEditProfileModal={showEditProfileModal} editProfileMember={editProfileMember}
        editProfileMode={editProfileMode}
        onCloseEditProfile={handleCloseEditProfile} onSaveEditProfile={handleSaveEditProfile}
      />
    );
  }

  // Project detail view
  return (
    <ProjectView
      activeProjects={activeProjects} selectedProject={selectedProject}
      selectedTask={selectedTask} teamMembers={teamMembers} currentView={currentView}
      {...sidebarProps}
      getTaskColor={getTaskColor} isTaskUrgent={isTaskUrgent}
      onTaskClick={setSelectedTask} updateProject={updateProject}
      onCloseTask={() => setSelectedTask(null)}
      onUpdateTask={(updates) => updateTask(selectedProject.id, selectedTask.id, updates)}
      showNewProjectModal={showNewProjectModal}
      onCloseNewProject={() => setShowNewProjectModal(false)} createProject={createProject}
      showTeamModal={showTeamModal} onCloseTeamModal={() => setShowTeamModal(false)}
      addTeamMember={addTeamMember} removeTeamMember={removeTeamMember}
      onEditTeamMember={handleEditTeamMember}
      showEditProfileModal={showEditProfileModal} editProfileMember={editProfileMember}
      editProfileMode={editProfileMode}
      onCloseEditProfile={handleCloseEditProfile} onSaveEditProfile={handleSaveEditProfile}
      showArchiveModal={showArchiveModal}
      onOpenArchiveModal={() => setShowArchiveModal(true)}
      onArchiveProject={archiveProject}
      onCloseArchiveModal={() => setShowArchiveModal(false)}
      showDeleteModal={showDeleteModal} dealToDelete={dealToDelete}
      onDeleteDeal={handleDeleteDeal} onConfirmDelete={handleConfirmDelete}
      onCancelDelete={handleCancelDelete}
      showEditProjectModal={showEditProjectModal}
      onOpenEditProject={() => setShowEditProjectModal(true)}
      onCloseEditProject={() => setShowEditProjectModal(false)}
      onSaveEditProject={(updates) => { updateProject(selectedProject.id, updates); setShowEditProjectModal(false); }}
    />
  );
};

export default App;
