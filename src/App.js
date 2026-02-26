import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

import SELLER_TEMPLATE from './templates/sellerTemplate';
import BUYER_TEMPLATE from './templates/buyerTemplate';

// Firestore service (replaces localStorage)
import {
  getUserProfile,
  updateUserProfile,
  loadOrgData as loadOrgDataFromFirestore,
  createProject as fsCreateProject,
  createTasks as fsCreateTasks,
  getTasks as fsGetTasks,
  updateProject as fsUpdateProject,
  deleteProject as fsDeleteProject,
  updateTask as fsUpdateTask,
  addMember as fsAddMember,
  updateMember as fsUpdateMember,
  deleteMember as fsDeleteMember,
  saveDefaultAssignments as fsSaveDefaultAssignments,
} from './services/firestoreService';

import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import ArchiveView from './components/dashboard/ArchiveView';
import SalesPipeline from './components/dashboard/SalesPipeline';
import TeamSettings from './components/dashboard/TeamSettings';
import ProjectView from './components/dashboard/ProjectView';
import NewProjectModal from './components/tasks/NewProjectModal';
import EditProfileModal from './components/tasks/EditProfileModal';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import MyProfilePage from './components/dashboard/MyProfilePage';
import SupportPage from './components/support/SupportPage';
import { loadOrgDataForImpersonation } from './services/superAdminService';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import { getOrganization } from './services/firestoreService';
import { sendNewDealNotifications, sendTaskAssignedNotification, sendDueSoonReminder, sendOverdueAlert } from './services/notificationService';

const App = () => {
  const [user, setUser] = useState(null);
  const [orgId, setOrgId] = useState(null);
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

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStepState] = useState(0);

  // Impersonation state
  const [impersonation, setImpersonation] = useState(null);
  const [originalOrgId, setOriginalOrgId] = useState(null);
  const [originalProjects, setOriginalProjects] = useState(null);
  const [originalTeamMembers, setOriginalTeamMembers] = useState(null);
  const [originalDefaultAssignments, setOriginalDefaultAssignments] = useState(null);

  // ============================================
  // LOAD ORG DATA (shared by auth listener + manual login)
  // ============================================
  const initializeOrg = async (userData) => {
    try {
      const orgData = await loadOrgDataFromFirestore(userData.orgId);
      setTeamMembers(orgData.members || []);
      setProjects(
        (orgData.projects || []).map(p => ({ ...p, status: p.status || 'active' }))
      );
      setDefaultAssignments(orgData.defaultAssignments || {});
    } catch (error) {
      console.error('Error loading org data:', error);
    }
  };

  // ============================================
  // AUTH STATE LISTENER (auto-login on page refresh)
  // ============================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile && profile.orgId) {
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              orgId: profile.orgId,
              platformRole: profile.platformRole || 'user',
            };
            setUser(userData);
            setOrgId(profile.orgId);
            await initializeOrg(userData);

            // Check onboarding status
            try {
              const orgDoc = await getOrganization(profile.orgId);
              if (orgDoc && !orgDoc.onboardingComplete) {
                setShowOnboarding(true);
                setOnboardingStepState(orgDoc.onboardingStep || 0);
              }
            } catch (err) {
              console.error('Error checking onboarding status:', err);
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // DUE SOON / OVERDUE CHECK (runs when projects load)
  // ============================================
  useEffect(() => {
    if (!projects.length || !teamMembers.length) return;

    const activeDeals = projects.filter(p => p.status === 'active');

    activeDeals.forEach(deal => {
      if (!deal.tasks) return;
      deal.tasks.forEach(task => {
        if (!task.dueDate || task.status === 'complete' || task.status === 'not-applicable') return;
        if (!task.assignedTo) return;

        const diffDays = Math.ceil(
          (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {
          sendOverdueAlert(deal, task, teamMembers);
        } else if (diffDays <= 1) {
          sendDueSoonReminder(deal, task, teamMembers);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  // ============================================
  // LOGIN CALLBACK (from LoginScreen)
  // ============================================
  const handleLogin = async (userData) => {
    setUser(userData);
    setOrgId(userData.orgId);
    if (userData.orgId) {
      setLoading(true);
      await initializeOrg(userData);

      // Check onboarding status
      try {
        const orgDoc = await getOrganization(userData.orgId);
        if (orgDoc && !orgDoc.onboardingComplete) {
          setShowOnboarding(true);
          setOnboardingStepState(orgDoc.onboardingStep || 0);
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }

      setLoading(false);
    }
  };

  // ============================================
  // PROJECT CRUD
  // ============================================
  const createProject = async (projectData) => {
    if (!isAdmin()) {
      alert('Permission denied: Only Admins can create new deals.');
      return;
    }
    const template = projectData.type === 'Buyer' ? BUYER_TEMPLATE : SELLER_TEMPLATE;

    // Prepare project doc (no tasks — those go in subcollection)
    const projectDoc = {
      type: projectData.type,
      clientName: projectData.clientName || '',
      propertyAddress: projectData.propertyAddress || '',
      phone: projectData.phone || '',
      email: projectData.email || '',
      contractDate: projectData.contractDate || '',
      status: 'active',
      listPrice: projectData.listPrice || '',
      contractPrice: projectData.contractPrice || '',
      commissionPercent: projectData.commissionPercent || '',
      brokerSplitType: projectData.brokerSplitType || '',
      brokerSplitValue: projectData.brokerSplitValue || '',
      transactionFee: projectData.transactionFee || '',
      tcFee: projectData.tcFee || '',
    };

    // 1. Create project in Firestore
    const projectId = await fsCreateProject(orgId, projectDoc);

    // 2. Build tasks from template
    const tasks = template.flatMap(themeGroup =>
      themeGroup.activities.map((activity, idx) => {
        const taskType = projectData.type === 'Buyer' ? 'buyer' : 'seller';
        const taskKey = `${taskType}-${themeGroup.theme}-${activity.name}`;
        const defaultAssigneeId = defaultAssignments[taskKey];
        const defaultAssignee = defaultAssigneeId
          ? teamMembers.find(m => m.id === defaultAssigneeId)
          : null;
        return {
          theme: themeGroup.theme,
          name: activity.name,
          notes: activity.notes,
          status: 'not-started',
          dueDate:
            projectData.contractDate && activity.daysOffset
              ? calculateDueDate(projectData.contractDate, activity.daysOffset)
              : null,
          userNotes: '',
          assignedTo: defaultAssignee
            ? `${defaultAssignee.firstName} ${defaultAssignee.lastName}`
            : '',
        };
      })
    );

    // 3. Batch write tasks to Firestore subcollection
    await fsCreateTasks(orgId, projectId, tasks);

    // 4. Load tasks back to get their Firestore IDs
    const loadedTasks = await fsGetTasks(orgId, projectId);

    const newProject = { id: projectId, ...projectDoc, tasks: loadedTasks };

    // Send new deal email notifications to all assigned team members
    sendNewDealNotifications(projectDoc, loadedTasks, teamMembers);

    setProjects(prev => [...prev, newProject]);
    setShowNewProjectModal(false);
    setSelectedProject(newProject);
    setCurrentView('project');
  };

  const updateProject = async (projectId, updates) => {
    // Separate tasks from project-level updates (tasks live in subcollection)
    const { tasks, id, ...projectUpdates } = updates;

    if (Object.keys(projectUpdates).length > 0) {
      await fsUpdateProject(orgId, projectId, projectUpdates);
    }

    const updated = projects.map(p =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    setProjects(updated);
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

    await fsDeleteProject(orgId, idToDelete);
    setProjects(prev => prev.filter(p => p.id !== idToDelete));

    setShowDeleteModal(false);
    setDealToDelete(null);
    if (selectedProject?.id === idToDelete) {
      setSelectedProject(null);
      setCurrentView('dashboard');
    }
  };

  // ============================================
  // TASK CRUD
  // ============================================
  const updateTask = async (projectId, taskId, updates) => {
    await fsUpdateTask(orgId, projectId, taskId, updates);

    // If assignedTo changed, notify the new assignee
    if (updates.assignedTo) {
      const project = projects.find(p => p.id === projectId);
      const task = project?.tasks?.find(t => t.id === taskId);
      if (project && task) {
        sendTaskAssignedNotification(project, { ...task, ...updates }, teamMembers);
      }
    }

    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
        };
      }
      return p;
    });
    setProjects(updated);
    if (selectedProject?.id === projectId) {
      setSelectedProject(updated.find(p => p.id === projectId));
    }
  };

  // ============================================
  // TEAM MEMBER CRUD
  // ============================================
  const addTeamMember = async (memberData) => {
    const newMember = {
      ...memberData,
      role: memberData.role || 'member',
      notificationPreference: 'email',
    };
    const memberId = await fsAddMember(orgId, newMember);
    setTeamMembers(prev => [...prev, { id: memberId, ...newMember }]);
  };

  const removeTeamMember = async (memberId) => {
    await fsDeleteMember(orgId, memberId);
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));

    // Clean up default assignments for removed member
    const newAssignments = { ...defaultAssignments };
    Object.keys(newAssignments).forEach(taskId => {
      if (newAssignments[taskId] === memberId) delete newAssignments[taskId];
    });
    handleSaveDefaultAssignments(newAssignments);
  };

  const updateTeamMember = async (memberId, updates) => {
    await fsUpdateMember(orgId, memberId, updates);

    const updated = teamMembers.map(m =>
      m.id === memberId ? { ...m, ...updates } : m
    );
    setTeamMembers(updated);

    // If the user updated their own profile, reflect it
    const updatedMember = updated.find(m => m.id === memberId);
    if (user && updatedMember && user.email === updatedMember.email) {
      setUser(prev => ({
        ...prev,
        firstName: updatedMember.firstName,
        lastName: updatedMember.lastName,
      }));
    }
  };

  // ============================================
  // DEFAULT ASSIGNMENTS
  // ============================================
  const handleSaveDefaultAssignments = async (assignments) => {
    setDefaultAssignments(assignments);
    await fsSaveDefaultAssignments(orgId, assignments);
  };

  // ============================================
  // LOGOUT
  // ============================================
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setOrgId(null);
    setProjects([]);
    setTeamMembers([]);
    setDefaultAssignments({});
    setCurrentView('pipeline');
    setSelectedProject(null);
    setSelectedTask(null);
    setImpersonation(null);
    setOriginalOrgId(null);
    setOriginalProjects(null);
    setOriginalTeamMembers(null);
    setOriginalDefaultAssignments(null);
  };

  // ============================================
  // IMPERSONATION (SuperAdmin only)
  // ============================================
  const handleImpersonate = async ({ orgId: targetOrgId, orgName, memberName, memberEmail }) => {
    // Save current state so we can restore it later
    setOriginalOrgId(orgId);
    setOriginalProjects(projects);
    setOriginalTeamMembers(teamMembers);
    setOriginalDefaultAssignments(defaultAssignments);

    // Load target org's data
    try {
      const orgData = await loadOrgDataForImpersonation(targetOrgId);
      setOrgId(targetOrgId);
      setProjects(
        (orgData.projects || []).map(p => ({ ...p, status: p.status || 'active' }))
      );
      setTeamMembers(orgData.members || []);
      setDefaultAssignments({});
      setImpersonation({ orgId: targetOrgId, orgName, memberName, memberEmail });
      setCurrentView('pipeline');
      setSelectedProject(null);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error impersonating:', error);
      alert('Failed to load organization data.');
      setOriginalOrgId(null);
      setOriginalProjects(null);
      setOriginalTeamMembers(null);
      setOriginalDefaultAssignments(null);
    }
  };

  const handleExitImpersonation = () => {
    // Restore original state
    setOrgId(originalOrgId);
    setProjects(originalProjects || []);
    setTeamMembers(originalTeamMembers || []);
    setDefaultAssignments(originalDefaultAssignments || {});
    setImpersonation(null);
    setOriginalOrgId(null);
    setOriginalProjects(null);
    setOriginalTeamMembers(null);
    setOriginalDefaultAssignments(null);
    setCurrentView('superAdmin');
    setSelectedProject(null);
    setSelectedTask(null);
  };

  // ============================================
  // HELPERS (unchanged logic)
  // ============================================
  const getDealTitle = (deal) => {
    if (!deal) return '';
    return deal.type === 'Buyer'
      ? deal.clientName || 'New Buyer Deal'
      : deal.propertyAddress || 'New Seller Deal';
  };

  const isAdmin = () => {
    if (!user || teamMembers.length === 0) return true;
    const currentMember = teamMembers.find(m => m.email === user.email);
    return currentMember?.role === 'admin' || teamMembers[0]?.email === user.email;
  };

  const isSuperAdmin = () => user?.platformRole === 'superAdmin';

  const getCurrentUserMember = () =>
    teamMembers.find(m => m.email === user?.email);

  const calculateDueDate = (startDate, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const isTaskUrgent = (task) => {
    if (task.status === 'complete') return false;
    if (!task.dueDate) return false;
    const diffDays = Math.ceil(
      (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
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
      p.tasks.map(t => ({
        ...t,
        projectName: p.propertyAddress,
        projectId: p.id,
        projectClientName: p.clientName,
        projectType: p.type,
      }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete' || t.status === 'not-applicable')
        return false;
      const diffDays = Math.ceil(
        (new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= 3;
    });
  };

  const getOverdueTasks = () => {
    const active = projects.filter(p => p.status === 'active');
    const allTasks = active.flatMap(p =>
      p.tasks.map(t => ({
        ...t,
        projectName: p.propertyAddress,
        projectId: p.id,
        projectClientName: p.clientName,
        projectType: p.type,
      }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete' || t.status === 'not-applicable')
        return false;
      return new Date(t.dueDate) < new Date();
    });
  };

  const getMyTasks = () => {
    const active = projects.filter(p => p.status === 'active');
    const allTasks = active.flatMap(p =>
      p.tasks.map(t => ({
        ...t,
        projectName: p.propertyAddress,
        projectId: p.id,
        projectClientName: p.clientName,
        projectType: p.type,
      }))
    );
    const normalizedUserName = user
      ? `${user.firstName} ${user.lastName || ''}`.trim().toLowerCase()
      : '';
    return allTasks.filter(t => {
      if (!t.assignedTo) return false;
      return (
        t.assignedTo.toLowerCase().trim() === normalizedUserName &&
        t.status !== 'complete' &&
        t.status !== 'not-applicable'
      );
    });
  };

  const groupTasksByDeal = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      if (!grouped[task.projectId]) {
        grouped[task.projectId] = {
          projectId: task.projectId,
          projectName: task.projectName,
          projectClientName: task.projectClientName,
          tasks: [],
          taskCount: 0,
        };
      }
      grouped[task.projectId].tasks.push(task);
      grouped[task.projectId].taskCount++;
    });
    return Object.values(grouped);
  };

  const getMyTasksGroupedByDeal = () => groupTasksByDeal(getMyTasks());
  const getOverdueTasksGroupedByDeal = () => groupTasksByDeal(getOverdueTasks());
  const getDueSoonTasksGroupedByDeal = () => groupTasksByDeal(getDueSoonTasks());

  // --- Shared callbacks (unchanged) ---
  const handleSelectProject = (p) => {
    setSelectedProject(p);
    setCurrentView('project');
  };

  const handleOpenMyProfile = () => {
    setCurrentView('myProfile');
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
    const project = projects
      .filter(p => p.status === 'active')
      .find(p => p.id === task.projectId);
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
      if (updates.status === 'complete') {
        const remaining = updatedTasks.filter(t => t.status !== 'complete');
        if (remaining.length === 0) {
          setShowMyTasksModal(false);
          setMyTasksModalDeal(null);
          setMyTasksModalType('assigned');
        } else {
          setMyTasksModalDeal({
            ...myTasksModalDeal,
            tasks: remaining,
            taskCount: remaining.length,
          });
        }
      } else {
        setMyTasksModalDeal({ ...myTasksModalDeal, tasks: updatedTasks });
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

  const handleConfirmDelete = () => {
    deleteProject(dealToDelete.id);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDealToDelete(null);
  };

  // --- Render ---
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // Show onboarding wizard for new orgs
  if (showOnboarding && !impersonation) {
    return (
      <OnboardingWizard
        orgId={orgId}
        currentUser={user}
        initialStep={onboardingStep}
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentView('pipeline');
        }}
        onCreateDeal={() => {
          setShowOnboarding(false);
          setShowNewProjectModal(true);
          setCurrentView('pipeline');
        }}
      />
    );
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  // Shared sidebar props
  const sidebarProps = {
    projects: activeProjects,
    onSelectProject: handleSelectProject,
    onPipeline: () => setCurrentView('pipeline'),
    onDashboard: () => setCurrentView('dashboard'),
    onArchive: () => setCurrentView('archive'),
    onNewProject: () => setShowNewProjectModal(true),
    onTeamSettings: () => setCurrentView('teamSettings'),
    onMyProfile: handleOpenMyProfile,
    onHelpSupport: () => setCurrentView('helpSupport'),
    onSuperAdmin: () => setCurrentView('superAdmin'),
    onLogout: handleLogout,
    currentView,
    getDealTitle,
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    user,
    orgId,
  };

  // --- Impersonation Banner (fixed position — shows on ALL views) ---
  const ImpersonationBanner = () => {
    if (!impersonation) return null;
    return (
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: '#E53E3E', color: '#FFFFFF', zIndex: 9999 }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="w-4 h-4" />
          Viewing as {impersonation.memberName} — {impersonation.orgName}
        </div>
        <button
          onClick={handleExitImpersonation}
          className="px-3 py-1 rounded text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', color: '#E53E3E' }}
        >
          Exit Impersonation
        </button>
      </div>
    );
  };

  // Padding to push content below the fixed banner
  const impersonationPadding = impersonation ? { paddingTop: '40px' } : {};

  if (currentView === 'helpSupport') {
    return (
      <>
        <ImpersonationBanner />
        <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF', ...impersonationPadding }}>
          <Sidebar {...sidebarProps} />
          <SupportPage user={user} orgId={orgId} />
        </div>
      </>
    );
  }
  if (currentView === 'myProfile') {
    const currentMember = getCurrentUserMember();
    if (currentMember) {
      return (
        <>
          <ImpersonationBanner />
          <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF', ...impersonationPadding }}>
            <Sidebar {...sidebarProps} />
            <MyProfilePage
              member={currentMember}
              isAdmin={isAdmin()}
              onSave={(memberId, updates) => {
                updateTeamMember(memberId, updates);
              }}
            />
          </div>
        </>
      );
    }
  }
  if (currentView === 'superAdmin' && isSuperAdmin()) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar {...sidebarProps} />
        <SuperAdminDashboard onImpersonate={handleImpersonate} />
      </div>
    );
  }

  if (currentView === 'pipeline') {
    return (
      <>
        <ImpersonationBanner />
        <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF', ...impersonationPadding }}>
          <Sidebar {...sidebarProps} />
          <div className="flex-1 overflow-auto">
            <SalesPipeline projects={activeProjects} getDealTitle={getDealTitle} />
          </div>
          {showNewProjectModal && (
            <NewProjectModal
              onClose={() => setShowNewProjectModal(false)}
              onSave={createProject}
            />
          )}
        </div>
      </>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <ImpersonationBanner />
        <div style={impersonationPadding}>
          <DashboardView
        user={user}
        activeProjects={activeProjects}
        teamMembers={teamMembers}
        currentView={currentView}
        {...sidebarProps}
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
        </div>
      </>
    );
  }

  if (currentView === 'teamSettings') {
    return (
      <>
        <ImpersonationBanner />
        <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF', ...impersonationPadding }}>
        <Sidebar {...sidebarProps} />
        <div className="flex-1 overflow-auto">
          <TeamSettings
            teamMembers={teamMembers}
            onAddMember={addTeamMember}
            onRemoveMember={removeTeamMember}
            onEditMember={handleEditTeamMember}
            defaultAssignments={defaultAssignments}
            onSaveDefaults={handleSaveDefaultAssignments}
            sellerTemplate={SELLER_TEMPLATE}
            buyerTemplate={BUYER_TEMPLATE}
            isAdmin={isAdmin()}
          />
        </div>
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember}
            mode={editProfileMode}
            isAdmin={isAdmin()}
            onClose={handleCloseEditProfile}
            onSave={handleSaveEditProfile}
          />
        )}
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onSave={createProject}
          />
        )}
      </div>
      </>
    );
  }

  if (currentView === 'archive') {
    return (
      <>
        <ImpersonationBanner />
        <div style={impersonationPadding}>
          <ArchiveView
            activeProjects={activeProjects}
            archivedProjects={archivedProjects}
            teamMembers={teamMembers}
            currentView={currentView}
            {...sidebarProps}
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
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
            showEditProfileModal={showEditProfileModal}
            editProfileMember={editProfileMember}
            editProfileMode={editProfileMode}
            onCloseEditProfile={handleCloseEditProfile}
            onSaveEditProfile={handleSaveEditProfile}
          />
        </div>
      </>
    );
  }

  // Project detail view
  return (
    <>
      <ImpersonationBanner />
      <div style={impersonationPadding}>
        <ProjectView
      activeProjects={activeProjects}
      selectedProject={selectedProject}
      selectedTask={selectedTask}
      teamMembers={teamMembers}
      currentView={currentView}
      {...sidebarProps}
      getTaskColor={getTaskColor}
      isTaskUrgent={isTaskUrgent}
      onTaskClick={setSelectedTask}
      updateProject={updateProject}
      onCloseTask={() => setSelectedTask(null)}
      onUpdateTask={(updates) =>
        updateTask(selectedProject.id, selectedTask.id, updates)
      }
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
      showArchiveModal={showArchiveModal}
      onOpenArchiveModal={() => setShowArchiveModal(true)}
      onArchiveProject={archiveProject}
      onCloseArchiveModal={() => setShowArchiveModal(false)}
      showDeleteModal={showDeleteModal}
      dealToDelete={dealToDelete}
      onDeleteDeal={handleDeleteDeal}
      onConfirmDelete={handleConfirmDelete}
      onCancelDelete={handleCancelDelete}
      showEditProjectModal={showEditProjectModal}
      onOpenEditProject={() => setShowEditProjectModal(true)}
      onCloseEditProject={() => setShowEditProjectModal(false)}
      onSaveEditProject={(updates) => {
        updateProject(selectedProject.id, updates);
        setShowEditProjectModal(false);
      }}
    />
      </div>
    </>
  );
};

export default App;
