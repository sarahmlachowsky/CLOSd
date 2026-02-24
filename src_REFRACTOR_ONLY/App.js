import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import React, { useState, useEffect } from 'react';
import { X, Edit2, Archive } from 'lucide-react';

import { SELLER_TEMPLATE } from './templates/sellerTemplate';
import { BUYER_TEMPLATE } from './templates/buyerTemplate';
import { storage } from './services/firebaseService';

import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import ArchiveView from './components/dashboard/ArchiveView';
import KanbanBoard from './components/tasks/KanbanBoard';
import TaskDetailPanel from './components/tasks/TaskDetailPanel';
import NewProjectModal from './components/tasks/NewProjectModal';
import EditProjectModal from './components/tasks/EditProjectModal';
import TeamMemberModal from './components/tasks/TeamMemberModal';
import EditProfileModal from './components/tasks/EditProfileModal';
import ArchiveConfirmModal from './components/tasks/ArchiveConfirmModal';
import DeleteConfirmModal from './components/tasks/DeleteConfirmModal';

const App = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = storage.get('user');
      const projectsData = storage.get('projects');
      const teamData = storage.get('team');
      
      if (userData) setUser(JSON.parse(userData.value));
      if (projectsData) {
        const loadedProjects = JSON.parse(projectsData.value);
        const migratedProjects = loadedProjects.map(p => ({
          ...p,
          status: p.status || 'active'
        }));
        setProjects(migratedProjects);
      }
      if (teamData) setTeamMembers(JSON.parse(teamData.value));
    } catch (error) {
      console.log('Starting fresh');
    }
    setLoading(false);
  };

  const saveUser = async (userData) => {
    try {
      storage.set('user', JSON.stringify(userData));
      setUser(userData);
      
      const teamData = storage.get('team');
      let currentTeam = teamData ? JSON.parse(teamData.value) : [];
      
      const userExists = currentTeam.some(member => member.email === userData.email);
      if (!userExists) {
        const newMember = {
          id: Date.now().toString(),
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          email: userData.email,
          phone: '',
          role: currentTeam.length === 0 ? 'admin' : 'member'
        };
        currentTeam = [...currentTeam, newMember];
        storage.set('team', JSON.stringify(currentTeam));
        setTeamMembers(currentTeam);
      } else {
        setTeamMembers(currentTeam);
      }
    } catch (error) {
      setUser(userData);
    }
  };

  const saveProjects = async (projectsData) => {
    try {
      storage.set('projects', JSON.stringify(projectsData));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error saving');
    }
  };

  const saveTeamMembers = async (teamData) => {
    try {
      storage.set('team', JSON.stringify(teamData));
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error saving team');
    }
  };

  const addTeamMember = async (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      role: memberData.role || 'member',
      notificationPreference: 'email'
    };
    const updated = [...teamMembers, newMember];
    await saveTeamMembers(updated);
  };

  const removeTeamMember = async (memberId) => {
    const updated = teamMembers.filter(m => m.id !== memberId);
    await saveTeamMembers(updated);
  };

  const updateTeamMember = async (memberId, updates) => {
    const updated = teamMembers.map(m => 
      m.id === memberId ? { ...m, ...updates } : m
    );
    await saveTeamMembers(updated);
    
    const updatedMember = updated.find(m => m.id === memberId);
    if (user && updatedMember && user.email === updatedMember.email) {
      const newUser = {
        ...user,
        firstName: updatedMember.firstName,
        lastName: updatedMember.lastName
      };
      setUser(newUser);
      storage.set('user', JSON.stringify(newUser));
    }
  };

  // Helper function to get deal title based on type
  const getDealTitle = (deal) => {
    if (!deal) return '';
    if (deal.type === 'Buyer') {
      return deal.clientName || 'New Buyer Deal';
    }
    return deal.propertyAddress || 'New Seller Deal';
  };

  const isAdmin = () => {
    if (!user || teamMembers.length === 0) return true;
    const currentMember = teamMembers.find(m => m.email === user.email);
    return currentMember?.role === 'admin' || teamMembers[0]?.email === user.email;
  };

  const getCurrentUserMember = () => {
    return teamMembers.find(m => m.email === user?.email);
  };

  const createProject = async (projectData) => {
    // Only admins can create deals
    if (!isAdmin()) {
      alert('Permission denied: Only Admins can create new deals.');
      return;
    }
    
    // Select template based on deal type
    const template = projectData.type === 'Buyer' ? BUYER_TEMPLATE : SELLER_TEMPLATE;
    
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      status: 'active',
      createdAt: new Date().toISOString(),
      tasks: template.flatMap(themeGroup => 
        themeGroup.activities.map((activity, idx) => ({
          id: `${themeGroup.group}-${idx}`,
          theme: themeGroup.theme,
          name: activity.name,
          notes: activity.notes,
          status: 'not-started',
          dueDate: projectData.contractDate && activity.daysOffset 
            ? calculateDueDate(projectData.contractDate, activity.daysOffset)
            : null,
          userNotes: ''
        }))
      )
    };

    const updated = [...projects, newProject];
    await saveProjects(updated);
    setShowNewProjectModal(false);
    setSelectedProject(newProject);
    setCurrentView('project');
  };

  const updateProject = async (projectId, updates) => {
    const updated = projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    await saveProjects(updated);
    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, ...updates });
    }
  };

  const archiveProject = async () => {
    await updateProject(selectedProject.id, { status: 'archived' });
    setShowArchiveModal(false);
    setSelectedProject(null);
    setCurrentView('dashboard');
  };

  const unarchiveProject = async (projectId) => {
    await updateProject(projectId, { status: 'active' });
  };

  const deleteProject = async (projectId = null) => {
    const idToDelete = projectId || selectedProject?.id;
    if (!idToDelete) return;
    
    const updated = projects.filter(p => p.id !== idToDelete);
    await saveProjects(updated);
    setShowDeleteModal(false);
    setDealToDelete(null);
    
    if (selectedProject?.id === idToDelete) {
      setSelectedProject(null);
      setCurrentView('dashboard');
    }
  };

  const calculateDueDate = (startDate, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const updateTask = async (projectId, taskId, updates) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        };
      }
      return p;
    });
    await saveProjects(updated);
    if (selectedProject?.id === projectId) {
      setSelectedProject(updated.find(p => p.id === projectId));
    }
  };

  const isTaskUrgent = (task) => {
    if (task.status === 'complete') return false;
    if (!task.dueDate) return false;
    const today = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays < 0 || diffDays <= 3;
  };

  const getTaskColor = (task) => {
    // Status-based styling (highest priority for complete)
    if (task.status === 'complete') return 'bg-blue-500 text-white';
    
    // Due date urgency styling (overrides status styling if urgent)
    if (task.dueDate) {
      const today = new Date();
      const due = new Date(task.dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'bg-red-500 text-white';
      if (diffDays <= 3) return 'bg-yellow-400';
    }
    
    // Status-based styling for non-urgent tasks
    const statusStyles = {
      'not-started': 'border-2 border-gray-400 text-white',
      'in-progress': 'bg-white border-2 border-gray-200'
    };
    
    return statusStyles[task.status] || 'bg-gray-200 border-2 border-gray-300';
  };

  const getDueSoonTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p => 
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete') return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  };

  const getOverdueTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete') return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      return due < today;
    });
  };

  const getMyTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p => 
      p.tasks.map(t => ({ 
        ...t, 
        projectName: p.propertyAddress, 
        projectId: p.id,
        projectClientName: p.clientName,
        projectType: p.type
      }))
    );
    const userFullName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : '';
    
    // Normalize comparison to handle whitespace/case inconsistencies
    const normalizedUserName = userFullName.toLowerCase().trim();
    
    const myTasks = allTasks.filter(t => {
      if (!t.assignedTo) return false;
      const normalizedAssignee = t.assignedTo.toLowerCase().trim();
      const isAssignedToMe = normalizedAssignee === normalizedUserName;
      const isNotComplete = t.status !== 'complete';
      return isAssignedToMe && isNotComplete;
    });
    
    // DEBUG: Uncomment to verify task count matches
    // console.log(`[getMyTasks] User: "${userFullName}", Found ${myTasks.length} tasks:`, myTasks.map(t => ({ id: t.id, name: t.name, status: t.status, assignedTo: t.assignedTo })));
    
    return myTasks;
  };

  // Generic function to group any task list by deal
  const groupTasksByDeal = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      if (!grouped[task.projectId]) {
        grouped[task.projectId] = {
          projectId: task.projectId,
          projectName: task.projectName,
          projectClientName: task.projectClientName,
          tasks: [],
          taskCount: 0
        };
      }
      grouped[task.projectId].tasks.push(task);
      grouped[task.projectId].taskCount++;
    });
    
    return Object.values(grouped);
  };

  // Grouped task getters for each dashboard board
  const getMyTasksGroupedByDeal = () => groupTasksByDeal(getMyTasks());
  const getOverdueTasksGroupedByDeal = () => groupTasksByDeal(getOverdueTasks());
  const getDueSoonTasksGroupedByDeal = () => groupTasksByDeal(getDueSoonTasks());

  const handleLogout = async () => {
  try {
    await signOut(auth);            // logs out of Firebase
  } catch (e) {
    console.error("Logout error:", e);
  }

  // clear local storage + app state
  storage.delete("user");
  setUser(null);
  setCurrentView("dashboard");
  setSelectedProject(null);
  setSelectedTask(null);
};

  // --- Shared callbacks for child views ---

  const handleSelectProject = (p) => {
    setSelectedProject(p);
    setCurrentView('project');
  };

  const handleOpenMyProfile = () => {
    const member = getCurrentUserMember();
    if (member) {
      setEditProfileMember(member);
      setEditProfileMode('self');
      setShowEditProfileModal(true);
    }
  };

  const handleEditTeamMember = (member) => {
    setEditProfileMember(member);
    setEditProfileMode('admin');
    setShowEditProfileModal(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfileModal(false);
    setEditProfileMember(null);
  };

  const handleSaveEditProfile = (memberId, updates) => {
    updateTeamMember(memberId, updates);
    setShowEditProfileModal(false);
    setEditProfileMember(null);
  };

  const handleMyTasksDealClick = (deal, type) => {
    setMyTasksModalDeal(deal);
    setMyTasksModalType(type);
    setShowMyTasksModal(true);
  };

  const handleCloseMyTasksModal = () => {
    setShowMyTasksModal(false);
    setMyTasksModalDeal(null);
    setMyTasksModalType('assigned');
  };

  const handleMyTasksTaskClick = (task) => {
    const activeProjectsList = projects.filter(p => p.status === 'active');
    const project = activeProjectsList.find(p => p.id === task.projectId);
    setTaskDetailTask(task);
    setTaskDetailProject(project);
    setShowTaskDetailModal(true);
  };

  const handleCloseTaskDetail = () => {
    setShowTaskDetailModal(false);
    setTaskDetailTask(null);
    setTaskDetailProject(null);
  };

  const handleTaskDetailUpdate = (updates) => {
    updateTask(taskDetailTask.projectId, taskDetailTask.id, updates);
    if (myTasksModalDeal) {
      const updatedTasks = myTasksModalDeal.tasks.map(t => 
        t.id === taskDetailTask.id ? { ...t, ...updates } : t
      );
      // Always filter out completed tasks from modal (applies to all modal types)
      if (updates.status === 'complete') {
        const remainingTasks = updatedTasks.filter(t => t.status !== 'complete');
        if (remainingTasks.length === 0) {
          // Close modal if no tasks remain
          setShowMyTasksModal(false);
          setMyTasksModalDeal(null);
          setMyTasksModalType('assigned');
        } else {
          setMyTasksModalDeal({
            ...myTasksModalDeal,
            tasks: remainingTasks,
            taskCount: remainingTasks.length
          });
        }
      } else {
        setMyTasksModalDeal({
          ...myTasksModalDeal,
          tasks: updatedTasks
        });
      }
    }
    setShowTaskDetailModal(false);
    setTaskDetailTask(null);
    setTaskDetailProject(null);
  };

  const handleDeleteDeal = (project) => {
    setDealToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmArchiveDelete = () => {
    deleteProject(dealToDelete.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDealToDelete(null);
  };

  // --- Render ---

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={saveUser} />;
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  if (currentView === 'dashboard') {
    return (
      <DashboardView
        user={user}
        activeProjects={activeProjects}
        teamMembers={teamMembers}
        currentView={currentView}
        onSelectProject={handleSelectProject}
        onDashboard={() => setCurrentView('dashboard')}
        onArchive={() => setCurrentView('archive')}
        onNewProject={() => setShowNewProjectModal(true)}
        onManageTeam={() => setShowTeamModal(true)}
        onMyProfile={handleOpenMyProfile}
        onLogout={handleLogout}
        getDealTitle={getDealTitle}
        isAdmin={isAdmin()}
        getTaskColor={getTaskColor}
        isTaskUrgent={isTaskUrgent}
        getMyTasks={getMyTasks}
        getDueSoonTasks={getDueSoonTasks}
        getOverdueTasks={getOverdueTasks}
        getMyTasksGroupedByDeal={getMyTasksGroupedByDeal}
        getDueSoonTasksGroupedByDeal={getDueSoonTasksGroupedByDeal}
        getOverdueTasksGroupedByDeal={getOverdueTasksGroupedByDeal}
        showNewProjectModal={showNewProjectModal}
        onCloseNewProject={() => setShowNewProjectModal(false)}
        createProject={createProject}
        showTeamModal={showTeamModal}
        onCloseTeamModal={() => setShowTeamModal(false)}
        addTeamMember={addTeamMember}
        removeTeamMember={removeTeamMember}
        onEditTeamMember={handleEditTeamMember}
        showEditProfileModal={showEditProfileModal}
        editProfileMember={editProfileMember}
        editProfileMode={editProfileMode}
        onCloseEditProfile={handleCloseEditProfile}
        onSaveEditProfile={handleSaveEditProfile}
        showMyTasksModal={showMyTasksModal}
        myTasksModalDeal={myTasksModalDeal}
        myTasksModalType={myTasksModalType}
        onCloseMyTasksModal={handleCloseMyTasksModal}
        onMyTasksDealClick={handleMyTasksDealClick}
        onMyTasksTaskClick={handleMyTasksTaskClick}
        showTaskDetailModal={showTaskDetailModal}
        taskDetailTask={taskDetailTask}
        taskDetailProject={taskDetailProject}
        onCloseTaskDetail={handleCloseTaskDetail}
        onTaskDetailUpdate={handleTaskDetailUpdate}
      />
    );
  }

  if (currentView === 'archive') {
    return (
      <ArchiveView
        activeProjects={activeProjects}
        archivedProjects={archivedProjects}
        teamMembers={teamMembers}
        currentView={currentView}
        onSelectProject={handleSelectProject}
        onDashboard={() => setCurrentView('dashboard')}
        onArchive={() => setCurrentView('archive')}
        onNewProject={() => setShowNewProjectModal(true)}
        onManageTeam={() => setShowTeamModal(true)}
        onMyProfile={handleOpenMyProfile}
        onLogout={handleLogout}
        getDealTitle={getDealTitle}
        isAdmin={isAdmin()}
        unarchiveProject={unarchiveProject}
        onDeleteDeal={handleDeleteDeal}
        showNewProjectModal={showNewProjectModal}
        onCloseNewProject={() => setShowNewProjectModal(false)}
        createProject={createProject}
        showTeamModal={showTeamModal}
        onCloseTeamModal={() => setShowTeamModal(false)}
        addTeamMember={addTeamMember}
        removeTeamMember={removeTeamMember}
        onEditTeamMember={handleEditTeamMember}
        showDeleteModal={showDeleteModal}
        dealToDelete={dealToDelete}
        onConfirmDelete={handleConfirmArchiveDelete}
        onCancelDelete={handleCancelDelete}
        showEditProfileModal={showEditProfileModal}
        editProfileMember={editProfileMember}
        editProfileMode={editProfileMode}
        onCloseEditProfile={handleCloseEditProfile}
        onSaveEditProfile={handleSaveEditProfile}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
          projects={activeProjects}
          onSelectProject={handleSelectProject}
          onDashboard={() => setCurrentView('dashboard')}
          onArchive={() => setCurrentView('archive')}
          onNewProject={() => setShowNewProjectModal(true)}
          onManageTeam={() => setShowTeamModal(true)}
          onMyProfile={handleOpenMyProfile}
          onLogout={handleLogout}
          currentView={currentView}
          getDealTitle={getDealTitle}
          isAdmin={isAdmin()}
        />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{getDealTitle(selectedProject)}</h2>
              <button
                onClick={() => setShowEditProjectModal(true)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Edit deal details"
              >
                <Edit2 className="w-5 h-5" style={{ color: '#516469' }} />
              </button>
            </div>
            {selectedProject?.status === 'archived' ? (
              <button
                onClick={() => {
                  setDealToDelete(selectedProject);
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ 
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '2px solid #FCA5A5'
                }}
              >
                <X className="w-4 h-4" />
                Delete Deal
              </button>
            ) : (
              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '2px solid #FCD34D'
                }}
              >
                <Archive className="w-4 h-4" />
                Archive Deal
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Client:</span> <span className="font-medium">{selectedProject?.clientName}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span> <span className="font-medium">{selectedProject?.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedProject?.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span> <span className="font-medium">{selectedProject?.email || 'Not provided'}</span>
            </div>
            {selectedProject?.contractDate && (
              <div>
                <span className="text-gray-500">Under Contract Date:</span> <span className="font-medium">{selectedProject?.contractDate}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <KanbanBoard 
            project={selectedProject}
            onTaskClick={setSelectedTask}
            getTaskColor={getTaskColor}
            isTaskUrgent={isTaskUrgent}
          />
        </div>
      </div>
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          project={selectedProject}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => updateTask(selectedProject.id, selectedTask.id, updates)}
        />
      )}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSave={createProject}
        />
      )}
      {showTeamModal && (
          <TeamMemberModal
            onClose={() => setShowTeamModal(false)}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            onEdit={handleEditTeamMember}
            teamMembers={teamMembers}
            isAdmin={isAdmin()}
          />
        )}
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember}
            mode={editProfileMode}
            isAdmin={isAdmin()}
            onClose={handleCloseEditProfile}
            onSave={handleSaveEditProfile}
          />
        )}
      {showArchiveModal && (
        <ArchiveConfirmModal
          projectAddress={selectedProject?.propertyAddress}
          onConfirm={archiveProject}
          onCancel={() => setShowArchiveModal(false)}
        />
      )}
      {showDeleteModal && dealToDelete && (
        <DeleteConfirmModal
          projectAddress={dealToDelete.propertyAddress}
          onConfirm={() => deleteProject(dealToDelete.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setDealToDelete(null);
          }}
        />
      )}
      {showEditProjectModal && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setShowEditProjectModal(false)}
          onSave={(updates) => {
            updateProject(selectedProject.id, updates);
            setShowEditProjectModal(false);
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          projectAddress={selectedProject?.propertyAddress}
          onConfirm={deleteProject}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default App;