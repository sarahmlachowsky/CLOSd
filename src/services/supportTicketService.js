import { db } from '../firebase';
import {
  doc, collection, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, arrayUnion
} from 'firebase/firestore';

// ============================================
// SUPPORT TICKET OPERATIONS
// ============================================

/**
 * Create a new support ticket (called by client users)
 * Goes into top-level /supportTickets collection
 */
export const createTicket = async ({ orgId, uid, userName, subject, description, priority }) => {
  const ticketRef = await addDoc(collection(db, 'supportTickets'), {
    orgId,
    submittedBy: uid,
    submittedByName: userName,
    subject,
    description,
    status: 'open',
    priority: priority || 'medium',
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    resolvedAt: null,
  });
  return ticketRef.id;
};

/**
 * Get a single ticket by ID
 */
export const getTicket = async (ticketId) => {
  const snap = await getDoc(doc(db, 'supportTickets', ticketId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Get all tickets for a specific org (client-side: "My Tickets")
 */
export const getTicketsByOrg = async (orgId) => {
  const q = query(
    collection(db, 'supportTickets'),
    where('orgId', '==', orgId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Get all tickets platform-wide (SA Support tab)
 * Optional status filter
 */
export const getAllTickets = async (statusFilter) => {
  let q;
  if (statusFilter && statusFilter !== 'all') {
    q = query(
      collection(db, 'supportTickets'),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'supportTickets'),
      orderBy('createdAt', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Update ticket status (SA uses this to move open → in-progress → resolved)
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
  const updates = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (newStatus === 'resolved') {
    updates.resolvedAt = serverTimestamp();
  }
  await updateDoc(doc(db, 'supportTickets', ticketId), updates);
};

/**
 * Update ticket priority (SA can escalate/de-escalate)
 */
export const updateTicketPriority = async (ticketId, newPriority) => {
  await updateDoc(doc(db, 'supportTickets', ticketId), {
    priority: newPriority,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Add a message to the ticket thread (works for both client and SA replies)
 */
export const addTicketMessage = async (ticketId, { from, fromName, text }) => {
  await updateDoc(doc(db, 'supportTickets', ticketId), {
    messages: arrayUnion({
      from,
      fromName,
      text,
      timestamp: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  });
};
