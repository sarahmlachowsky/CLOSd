import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// ============================================
// PLATFORM-WIDE READS (SuperAdmin only)
// ============================================

export const getAllUsers = async () => {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllOrganizations = async () => {
  const snap = await getDocs(query(collection(db, 'organizations'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getOrgMembers = async (orgId) => {
  const snap = await getDocs(collection(db, 'organizations', orgId, 'members'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getOrgProjects = async (orgId) => {
  const snap = await getDocs(collection(db, 'organizations', orgId, 'projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Load full org data for impersonation (projects with tasks + members)
export const loadOrgDataForImpersonation = async (orgId) => {
  const [members, projectDocs] = await Promise.all([
    getOrgMembers(orgId),
    getOrgProjects(orgId),
  ]);

  const projects = await Promise.all(
    projectDocs.map(async (project) => {
      const tasksSnap = await getDocs(
        collection(db, 'organizations', orgId, 'projects', project.id, 'tasks')
      );
      const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { ...project, tasks };
    })
  );

  return { members, projects };
};
