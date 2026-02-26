import React, { useState, useEffect } from 'react';
import {
  Activity, HeadphonesIcon, BarChart3, UserCheck, Users, Building2,
  CreditCard, Clock, TrendingUp, AlertTriangle, RefreshCw, Eye, ChevronDown, ChevronRight,
  MessageSquare, CheckCircle, ArrowLeft, Send, Archive, Inbox
} from 'lucide-react';
import {
  getAllUsers, getAllOrganizations, getOrgMembers
} from '../../services/superAdminService';
import {
  getAllTickets, updateTicketStatus, updateTicketPriority, addTicketMessage
} from '../../services/supportTicketService';

const TABS = [
  { id: 'vitals', label: 'Vitals', icon: Activity },
  { id: 'support', label: 'Support Hub', icon: HeadphonesIcon },
  { id: 'kpis', label: 'Client KPIs', icon: BarChart3 },
  { id: 'impersonation', label: 'Impersonation', icon: UserCheck },
];

const SuperAdminDashboard = ({ onImpersonate }) => {
  const [activeTab, setActiveTab] = useState('vitals');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ backgroundColor: '#071D39', borderColor: '#89A8B1' }}>
        <h1 className="text-xl font-bold text-white">SuperAdmin Dashboard</h1>
        <p className="text-sm" style={{ color: '#89A8B1' }}>Platform management & monitoring</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b" style={{ borderColor: '#89A8B1' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
              style={{
                borderBottom: isActive ? '3px solid #071D39' : '3px solid transparent',
                color: isActive ? '#071D39' : '#516469',
                backgroundColor: isActive ? '#F0F4F5' : 'transparent',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#F5F7F8' }}>
        {activeTab === 'vitals' && <VitalsDashboard />}
        {activeTab === 'support' && <SupportHub />}
        {activeTab === 'kpis' && <KPIsPlaceholder />}
        {activeTab === 'impersonation' && <ImpersonationPanel onImpersonate={onImpersonate} />}
      </div>
    </div>
  );
};

// ============================================
// SUPPORT HUB (Phase 4b — LIVE)
// ============================================

const PRIORITY_STYLES = {
  high: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5', label: 'High' },
  medium: { bg: '#FEF9C3', text: '#A16207', border: '#FDE047', label: 'Medium' },
  low: { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC', label: 'Low' },
};

const STATUS_STYLES = {
  open: { bg: '#DBEAFE', text: '#2563EB', label: 'Open' },
  'in-progress': { bg: '#FEF9C3', text: '#A16207', label: 'In Progress' },
  resolved: { bg: '#DCFCE7', text: '#16A34A', label: 'Resolved' },
};

const SupportHub = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const all = await getAllTickets();
      setTickets(all);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Split tickets into open/in-progress vs resolved
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const displayTickets = showArchive ? resolvedTickets : openTickets;

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTickets(prev =>
        prev.map(t => t.id === ticketId
          ? { ...t, status: newStatus, updatedAt: new Date(), ...(newStatus === 'resolved' ? { resolvedAt: new Date() } : {}) }
          : t
        )
      );
      // If we just resolved the selected ticket, update it in detail view too
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({
          ...prev,
          status: newStatus,
          ...(newStatus === 'resolved' ? { resolvedAt: new Date() } : {}),
        }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await updateTicketPriority(ticketId, newPriority);
      setTickets(prev =>
        prev.map(t => t.id === ticketId ? { ...t, priority: newPriority } : t)
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, priority: newPriority }));
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const message = {
        from: 'superadmin',
        fromName: 'Support Team',
        text: replyText.trim(),
      };
      await addTicketMessage(selectedTicket.id, message);

      // Update local state with the new message
      const newMessage = { ...message, timestamp: new Date().toISOString() };
      setTickets(prev =>
        prev.map(t =>
          t.id === selectedTicket.id
            ? { ...t, messages: [...(t.messages || []), newMessage] }
            : t
        )
      );
      setSelectedTicket(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }));
      setReplyText('');

      // Auto-move to in-progress if still open
      if (selectedTicket.status === 'open') {
        await handleStatusChange(selectedTicket.id, 'in-progress');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
    setSending(false);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#516469' }} />
        <span className="ml-2" style={{ color: '#516469' }}>Loading tickets...</span>
      </div>
    );
  }

  // ---- TICKET DETAIL VIEW ----
  if (selectedTicket) {
    const pStyle = PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium;
    const sStyle = STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.open;

    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => { setSelectedTicket(null); setReplyText(''); }}
          className="flex items-center gap-2 mb-4 text-sm font-semibold"
          style={{ color: '#516469' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>

        {/* Ticket header card */}
        <div className="bg-white rounded-lg shadow p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#071D39' }}>{selectedTicket.subject}</h2>
              <p className="text-sm mt-1" style={{ color: '#516469' }}>
                From <span className="font-semibold">{selectedTicket.submittedByName}</span> · {formatDate(selectedTicket.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ backgroundColor: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}` }}
              >
                {pStyle.label}
              </span>
              <span
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{ backgroundColor: sStyle.bg, color: sStyle.text }}
              >
                {sStyle.label}
              </span>
            </div>
          </div>

          <div className="p-3 rounded mb-4" style={{ backgroundColor: '#F7FAFC', color: '#071D39' }}>
            {selectedTicket.description}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#516469' }}>Status:</span>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                className="text-xs p-1 rounded border"
                style={{ borderColor: '#89A8B1', color: '#071D39' }}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#516469' }}>Priority:</span>
              <select
                value={selectedTicket.priority}
                onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value)}
                className="text-xs p-1 rounded border"
                style={{ borderColor: '#89A8B1', color: '#071D39' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {selectedTicket.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: '#16A34A' }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Resolve
              </button>
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#071D39' }}>
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Conversation ({(selectedTicket.messages || []).length} messages)
            </h3>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
              <p className="text-sm text-center py-6" style={{ color: '#89A8B1' }}>No replies yet. Send the first response below.</p>
            ) : (
              selectedTicket.messages.map((msg, idx) => {
                const isSA = msg.from === 'superadmin';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: isSA ? '#071D39' : '#F0F4F5',
                      marginLeft: isSA ? '40px' : '0',
                      marginRight: isSA ? '0' : '40px',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: isSA ? '#89A8B1' : '#516469' }}
                      >
                        {msg.fromName || (isSA ? 'Support Team' : 'Client')}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: isSA ? '#89A8B1' : '#89A8B1' }}
                      >
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: isSA ? '#FFFFFF' : '#071D39' }}>
                      {msg.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply box */}
          {selectedTicket.status !== 'resolved' && (
            <div className="p-4 border-t" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 p-2 rounded border text-sm"
                  style={{ borderColor: '#89A8B1', color: '#071D39' }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 rounded text-sm font-semibold text-white flex items-center gap-1 self-end"
                  style={{
                    backgroundColor: sending || !replyText.trim() ? '#89A8B1' : '#071D39',
                    cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {selectedTicket.status === 'resolved' && (
            <div className="p-4 border-t text-center" style={{ borderColor: '#E2E8F0' }}>
              <p className="text-sm" style={{ color: '#89A8B1' }}>
                This ticket is resolved. Change the status above to reopen it and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- TICKET LIST VIEW ----
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#071D39' }}>
            {showArchive ? 'Resolved Tickets' : 'Support Hub'}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#516469' }}>
            {showArchive
              ? `${resolvedTickets.length} resolved ticket${resolvedTickets.length !== 1 ? 's' : ''}`
              : `${openTickets.length} open ticket${openTickets.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold border"
            style={{
              borderColor: showArchive ? '#071D39' : '#89A8B1',
              color: showArchive ? '#071D39' : '#516469',
              backgroundColor: showArchive ? '#F0F4F5' : 'transparent',
            }}
          >
            {showArchive ? <Inbox className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            {showArchive ? 'Back to Open' : 'View Resolved'}
          </button>
          <button
            onClick={loadTickets}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold"
            style={{ backgroundColor: '#071D39', color: '#FFFFFF' }}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {displayTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          {showArchive ? (
            <>
              <Archive className="w-12 h-12 mx-auto mb-4" style={{ color: '#89A8B1' }} />
              <p style={{ color: '#516469' }}>No resolved tickets yet.</p>
            </>
          ) : (
            <>
              <HeadphonesIcon className="w-12 h-12 mx-auto mb-4" style={{ color: '#89A8B1' }} />
              <p className="font-semibold" style={{ color: '#071D39' }}>All clear!</p>
              <p className="text-sm mt-1" style={{ color: '#516469' }}>No open tickets right now.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayTickets.map((ticket) => {
            const pStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
            const sStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
            const messageCount = (ticket.messages || []).length;

            return (
              <div
                key={ticket.id}
                className="rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTicket(ticket)}
                style={{ borderLeft: `4px solid ${pStyle.text}`, backgroundColor: '#EDF2F7' }}
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Priority badge */}
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}`, minWidth: '52px', textAlign: 'center' }}
                  >
                    {pStyle.label}
                  </span>

                  {/* Subject */}
                  <span className="font-semibold text-sm truncate" style={{ color: '#071D39', minWidth: '120px', maxWidth: '250px' }}>
                    {ticket.subject}
                  </span>

                  {/* Status badge */}
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: sStyle.bg, color: sStyle.text }}
                  >
                    {sStyle.label}
                  </span>

                  {/* Submitter */}
                  <span className="text-xs flex-shrink-0" style={{ color: '#516469' }}>
                    {ticket.submittedByName}
                  </span>

                  {/* Date */}
                  <span className="text-xs flex-shrink-0" style={{ color: '#89A8B1' }}>
                    {formatDate(ticket.createdAt)}
                  </span>

                  {/* Reply count */}
                  {messageCount > 0 && (
                    <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: '#89A8B1' }}>
                      <MessageSquare className="w-3 h-3" />{messageCount}
                    </span>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Quick resolve button */}
                  {ticket.status !== 'resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(ticket.id, 'resolved');
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: '#16A34A' }}
                      title="Resolve this ticket"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// VITALS DASHBOARD (Phase 4a — LIVE)
// ============================================

const VitalsDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadVitals = async () => {
    setLoading(true);
    try {
      const [allUsers, allOrgs] = await Promise.all([
        getAllUsers(),
        getAllOrganizations(),
      ]);
      setUsers(allUsers);
      setOrgs(allOrgs);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading vitals:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVitals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#516469' }} />
        <span className="ml-2" style={{ color: '#516469' }}>Loading vitals...</span>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalOrgs = orgs.length;

  const trialOrgs = orgs.filter(o => o.plan === 'trial').length;
  const paidOrgs = orgs.filter(o => o.plan === 'paid').length;
  const cancelledOrgs = orgs.filter(o => o.plan === 'cancelled').length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSignups = users.filter(u => {
    const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
    return created >= sevenDaysAgo;
  }).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlySignups = users.filter(u => {
    const created = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
    return created >= thirtyDaysAgo;
  }).length;

  const activeRecently = users.filter(u => {
    if (!u.lastLoginAt) return false;
    const lastLogin = u.lastLoginAt?.toDate ? u.lastLoginAt.toDate() : new Date(u.lastLoginAt);
    return lastLogin >= sevenDaysAgo;
  }).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: '#071D39' }}>Platform Vitals</h2>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs" style={{ color: '#89A8B1' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadVitals}
            className="flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold"
            style={{ backgroundColor: '#071D39', color: '#FFFFFF' }}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Users} label="Total Users" value={totalUsers} color="#071D39" />
        <MetricCard icon={Building2} label="Total Organizations" value={totalOrgs} color="#516469" />
        <MetricCard icon={TrendingUp} label="Signups (7d)" value={recentSignups} color="#2F855A" />
        <MetricCard icon={Clock} label="Active (7d)" value={activeRecently} color="#2B6CB0" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard icon={CreditCard} label="Trial Accounts" value={trialOrgs} color="#D69E2E" />
        <MetricCard icon={CreditCard} label="Paid Accounts" value={paidOrgs} color="#2F855A" />
        <MetricCard icon={AlertTriangle} label="Cancelled" value={cancelledOrgs} color="#E53E3E" />
        <MetricCard icon={TrendingUp} label="Signups (30d)" value={monthlySignups} color="#805AD5" />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
          <h3 className="font-semibold" style={{ color: '#071D39' }}>All Users</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Name</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Email</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Role</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Signed Up</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
              const lastLogin = u.lastLoginAt?.toDate ? u.lastLoginAt.toDate() : (u.lastLoginAt ? new Date(u.lastLoginAt) : null);
              return (
                <tr key={u.id} className="border-t" style={{ borderColor: '#E2E8F0' }}>
                  <td className="px-4 py-2" style={{ color: '#071D39' }}>{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-2" style={{ color: '#516469' }}>{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: u.platformRole === 'superAdmin' ? '#FED7D7' : '#E2E8F0',
                        color: u.platformRole === 'superAdmin' ? '#E53E3E' : '#516469',
                      }}>
                      {u.platformRole}
                    </span>
                  </td>
                  <td className="px-4 py-2" style={{ color: '#516469' }}>{createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-2" style={{ color: '#516469' }}>
                    {lastLogin ? lastLogin.toLocaleDateString() + ' ' + lastLogin.toLocaleTimeString() : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Org Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
          <h3 className="font-semibold" style={{ color: '#071D39' }}>All Organizations</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F7FAFC' }}>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Name</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Plan</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Created</th>
              <th className="text-left px-4 py-2 font-semibold" style={{ color: '#516469' }}>Org ID</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => {
              const createdAt = org.createdAt?.toDate ? org.createdAt.toDate() : new Date(org.createdAt);
              const planColors = {
                trial: { bg: '#FEFCBF', text: '#D69E2E' },
                paid: { bg: '#C6F6D5', text: '#2F855A' },
                cancelled: { bg: '#FED7D7', text: '#E53E3E' },
              };
              const planStyle = planColors[org.plan] || planColors.trial;
              return (
                <tr key={org.id} className="border-t" style={{ borderColor: '#E2E8F0' }}>
                  <td className="px-4 py-2 font-semibold" style={{ color: '#071D39' }}>{org.name}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ backgroundColor: planStyle.bg, color: planStyle.text }}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2" style={{ color: '#516469' }}>{createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-xs font-mono" style={{ color: '#89A8B1' }}>{org.id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// IMPERSONATION PANEL (Phase 4d — LIVE)
// ============================================

const ImpersonationPanel = ({ onImpersonate }) => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [orgMembers, setOrgMembers] = useState({});
  const [loadingMembers, setLoadingMembers] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const allOrgs = await getAllOrganizations();
        setOrgs(allOrgs);
      } catch (error) {
        console.error('Error loading orgs:', error);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleExpandOrg = async (orgId) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
      return;
    }
    setExpandedOrg(orgId);

    if (!orgMembers[orgId]) {
      setLoadingMembers(orgId);
      try {
        const members = await getOrgMembers(orgId);
        setOrgMembers(prev => ({ ...prev, [orgId]: members }));
      } catch (error) {
        console.error('Error loading members:', error);
      }
      setLoadingMembers(null);
    }
  };

  const handleImpersonate = (org, member) => {
    if (onImpersonate) {
      onImpersonate({
        orgId: org.id,
        orgName: org.name,
        memberName: `${member.firstName} ${member.lastName}`,
        memberEmail: member.email,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#516469' }} />
        <span className="ml-2" style={{ color: '#516469' }}>Loading organizations...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: '#071D39' }}>Account Impersonation</h2>
        <p className="text-sm mt-1" style={{ color: '#516469' }}>
          Select an organization, then choose a member to view their account. This does not count as a login or use a seat.
        </p>
      </div>

      <div className="space-y-3">
        {orgs.map((org) => {
          const isExpanded = expandedOrg === org.id;
          const members = orgMembers[org.id] || [];
          const isLoadingThis = loadingMembers === org.id;
          const planColors = {
            trial: { bg: '#FEFCBF', text: '#D69E2E' },
            paid: { bg: '#C6F6D5', text: '#2F855A' },
            cancelled: { bg: '#FED7D7', text: '#E53E3E' },
          };
          const planStyle = planColors[org.plan] || planColors.trial;

          return (
            <div key={org.id} className="bg-white rounded-lg shadow overflow-hidden">
              <button
                onClick={() => handleExpandOrg(org.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4" style={{ color: '#516469' }} />
                    : <ChevronRight className="w-4 h-4" style={{ color: '#516469' }} />
                  }
                  <Building2 className="w-5 h-5" style={{ color: '#071D39' }} />
                  <span className="font-semibold" style={{ color: '#071D39' }}>{org.name}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ backgroundColor: planStyle.bg, color: planStyle.text }}
                  >
                    {org.plan}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: '#89A8B1' }}>{org.id}</span>
              </button>

              {isExpanded && (
                <div className="border-t" style={{ borderColor: '#E2E8F0' }}>
                  {isLoadingThis ? (
                    <div className="px-4 py-3 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#516469' }} />
                      <span className="text-sm" style={{ color: '#516469' }}>Loading members...</span>
                    </div>
                  ) : members.length === 0 ? (
                    <div className="px-4 py-3">
                      <span className="text-sm" style={{ color: '#89A8B1' }}>No members found</span>
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-4 py-3 border-t"
                        style={{ borderColor: '#F0F0F0', backgroundColor: '#FAFAFA' }}
                      >
                        <div className="flex items-center gap-3 pl-8">
                          <Users className="w-4 h-4" style={{ color: '#89A8B1' }} />
                          <div>
                            <span className="text-sm font-semibold" style={{ color: '#071D39' }}>
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="text-xs ml-2" style={{ color: '#89A8B1' }}>
                              {member.email}
                            </span>
                            <span
                              className="ml-2 px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: '#E2E8F0', color: '#516469' }}
                            >
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleImpersonate(org, member)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold transition-colors hover:opacity-90"
                          style={{ backgroundColor: '#071D39', color: '#FFFFFF' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View As
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orgs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#89A8B1' }} />
          <p style={{ color: '#516469' }}>No organizations found.</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// METRIC CARD COMPONENT
// ============================================

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '15' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color: '#89A8B1' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  </div>
);

// ============================================
// PLACEHOLDER COMPONENT (Phase 4c)
// ============================================

const KPIsPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8 text-center">
    <BarChart3 className="w-12 h-12 mx-auto mb-4" style={{ color: '#89A8B1' }} />
    <h2 className="text-lg font-bold mb-2" style={{ color: '#071D39' }}>Client KPIs</h2>
    <p style={{ color: '#516469' }}>
      Per-org engagement tracking, at-risk accounts, login frequency, and task completion rates.
    </p>
    <p className="text-sm mt-4" style={{ color: '#89A8B1' }}>Coming in Phase 4c</p>
  </div>
);

export default SuperAdminDashboard;
