import { db } from '../firebase';
import {
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  addDoc, query, where, serverTimestamp, writeBatch
} from 'firebase/firestore';

// ============================================
// USER OPERATIONS
// ============================================

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    platformRole: data.platformRole || 'user',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, updates) => {
  await updateDoc(doc(db, 'users', uid), updates);
};

export const updateLastLogin = async (uid) => {
  await updateDoc(doc(db, 'users', uid), { lastLoginAt: serverTimestamp() });
};

// ============================================
// ORGANIZATION OPERATIONS
// ============================================

export const createOrganization = async (ownerUid, name) => {
  const orgRef = await addDoc(collection(db, 'organizations'), {
    name,
    ownerId: ownerUid,
    plan: 'trial',
    planStartDate: serverTimestamp(),
    trialEndDate: null,
    createdAt: serverTimestamp(),
  });
  // Link user to org
  await updateDoc(doc(db, 'users', ownerUid), { orgId: orgRef.id });
  return orgRef.id;
};

export const getOrganization = async (orgId) => {
  const snap = await getDoc(doc(db, 'organizations', orgId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateOrganization = async (orgId, updates) => {
  await updateDoc(doc(db, 'organizations', orgId), updates);
};

// ============================================
// MEMBER OPERATIONS (under organization)
// ============================================

export const addMember = async (orgId, memberData) => {
  const memberRef = await addDoc(
    collection(db, 'organizations', orgId, 'members'),
    {
      ...memberData,
      joinedAt: serverTimestamp(),
    }
  );
  return memberRef.id;
};

export const getMembers = async (orgId) => {
  const snap = await getDocs(collection(db, 'organizations', orgId, 'members'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateMember = async (orgId, memberId, updates) => {
  await updateDoc(doc(db, 'organizations', orgId, 'members', memberId), updates);
};

export const deleteMember = async (orgId, memberId) => {
  await deleteDoc(doc(db, 'organizations', orgId, 'members', memberId));
};

// ============================================
// PROJECT OPERATIONS (under organization)
// ============================================

export const createProject = async (orgId, projectData) => {
  const projectRef = await addDoc(
    collection(db, 'organizations', orgId, 'projects'),
    {
      ...projectData,
      createdAt: serverTimestamp(),
    }
  );
  return projectRef.id;
};

export const getProjects = async (orgId) => {
  const snap = await getDocs(collection(db, 'organizations', orgId, 'projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateProject = async (orgId, projectId, updates) => {
  await updateDoc(doc(db, 'organizations', orgId, 'projects', projectId), updates);
};

export const deleteProject = async (orgId, projectId) => {
  // Delete all tasks first, then the project
  const tasksSnap = await getDocs(
    collection(db, 'organizations', orgId, 'projects', projectId, 'tasks')
  );
  const batch = writeBatch(db);
  tasksSnap.docs.forEach(taskDoc => batch.delete(taskDoc.ref));
  batch.delete(doc(db, 'organizations', orgId, 'projects', projectId));
  await batch.commit();
};

// ============================================
// TASK OPERATIONS (under project)
// ============================================

export const createTasks = async (orgId, projectId, tasks) => {
  // Batch write all tasks at once (used when creating a new project)
  const batch = writeBatch(db);
  tasks.forEach(task => {
    const taskRef = doc(collection(db, 'organizations', orgId, 'projects', projectId, 'tasks'));
    batch.set(taskRef, task);
  });
  await batch.commit();
};

export const getTasks = async (orgId, projectId) => {
  const snap = await getDocs(
    collection(db, 'organizations', orgId, 'projects', projectId, 'tasks')
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTask = async (orgId, projectId, taskId, updates) => {
  await updateDoc(
    doc(db, 'organizations', orgId, 'projects', projectId, 'tasks', taskId),
    updates
  );
};

// ============================================
// DEFAULT ASSIGNMENTS (under organization)
// ============================================

export const getDefaultAssignments = async (orgId) => {
  const snap = await getDoc(doc(db, 'organizations', orgId, 'defaultAssignments', 'config'));
  return snap.exists() ? snap.data().assignments || {} : {};
};

export const saveDefaultAssignments = async (orgId, assignments) => {
  await setDoc(
    doc(db, 'organizations', orgId, 'defaultAssignments', 'config'),
    { assignments, updatedAt: serverTimestamp() }
  );
};

// ============================================
// ONBOARDING OPERATIONS
// ============================================

export const updateOnboardingStep = async (orgId, step) => {
  await updateDoc(doc(db, 'organizations', orgId), { onboardingStep: step });
};

export const completeOnboarding = async (orgId) => {
  await updateDoc(doc(db, 'organizations', orgId), {
    onboardingComplete: true,
    onboardingStep: 5,
  });
};

export const saveDefaultAssignment = async (orgId, assignment) => {
  const configRef = doc(db, 'organizations', orgId, 'defaultAssignments', 'config');
  const snap = await getDoc(configRef);
  const current = snap.exists() ? snap.data().assignments || {} : {};

  const key = assignment.dealType + '__' + assignment.taskName;
  current[key] = {
    dealType: assignment.dealType,
    taskName: assignment.taskName,
    assignedTo: assignment.assignedTo,
    assignedUid: assignment.assignedUid || '',
  };

  await setDoc(configRef, { assignments: current, updatedAt: serverTimestamp() });
};

// ============================================
// HELPER: Load full org data (projects + tasks + members)
// ============================================

export const loadOrgData = async (orgId) => {
  const [members, projectDocs] = await Promise.all([
    getMembers(orgId),
    getProjects(orgId),
  ]);

  // Load tasks for each project in parallel
  const projects = await Promise.all(
    projectDocs.map(async (project) => {
      const tasks = await getTasks(orgId, project.id);
      return { ...project, tasks };
    })
  );

  const defaultAssignments = await getDefaultAssignments(orgId);

  return { members, projects, defaultAssignments };
};
