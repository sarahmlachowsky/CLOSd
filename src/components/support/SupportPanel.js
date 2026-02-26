import React, { useState, useEffect } from 'react';
import { X, Plus, ArrowLeft, Send, MessageSquare, RefreshCw } from 'lucide-react';
import { getTicketsByOrg, createTicket, addTicketMessage } from '../../services/supportTicketService';

const PRIORITY_STYLES = {
  high: { bg: '#FEE2E2', text: '#DC2626', label: 'High' },
  medium: { bg: '#FEF9C3', text: '#A16207', label: 'Medium' },
  low: { bg: '#DCFCE7', text: '#16A34A', label: 'Low' },
};

const STATUS_STYLES = {
  open: { bg: '#DBEAFE', text: '#2563EB', label: 'Open' },
  'in-progress': { bg: '#FEF9C3', text: '#A16207', label: 'In Progress' },
  resolved: { bg: '#DCFCE7', text: '#16A34A', label: 'Resolved' },
};

const SupportPanel = ({ user, orgId, onClose }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedTicket, setSelectedTicket] = useState(null);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reply
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const all = await getTicketsByOrg(orgId);
      setTickets(all);
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleSubmitTicket = async () => {
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    if (!description.trim()) { setError('Please describe your issue.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await createTicket({
        orgId,
        uid: user.uid,
        userName: `${user.firstName} ${user.lastName || ''}`.trim(),
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });
      setSubject('');
      setDescription('');
      setPriority('medium');
      setView('list');
      await loadTickets();
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const message = {
        from: user.uid,
        fromName: `${user.firstName} ${user.lastName || ''}`.trim(),
        text: replyText.trim(),
      };
      await addTicketMessage(selectedTicket.id, message);
      const newMessage = { ...message, timestamp: new Date().toISOString() };
      setSelectedTicket(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }));
      setTickets(prev =>
        prev.map(t =>
          t.id === selectedTicket.id
            ? { ...t, messages: [...(t.messages || []), newMessage] }
            : t
        )
      );
      setReplyText('');
    } catch (err) {
      console.error('Error sending reply:', err);
    }
    setSending(false);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openTickets = tickets.filter(t => t.status !== 'resolved');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 flex flex-col"
        style={{ border: '2px solid #89A8B1', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg flex-shrink-0"
          style={{ backgroundColor: '#071D39' }}
        >
          <h2 className="text-lg font-semibold text-white">
            {view === 'new' ? 'New Ticket' : view === 'detail' ? 'Ticket Details' : 'Help & Support'}
          </h2>
          <button onClick={onClose} className="text-white hover:opacity-75">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">

          {/* ---- LIST VIEW ---- */}
          {view === 'list' && (
            <div className="p-4">
              <button
                onClick={() => setView('new')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded font-semibold text-white mb-4"
                style={{ backgroundColor: '#071D39' }}
              >
                <Plus className="w-4 h-4" />
                Submit a New Ticket
              </button>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin" style={{ color: '#516469' }} />
                  <span className="ml-2 text-sm" style={{ color: '#516469' }}>Loading tickets...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: '#89A8B1' }} />
                  <p className="text-sm" style={{ color: '#516469' }}>No tickets yet. Submit one above if you need help!</p>
                </div>
              ) : (
                <>
                  {/* Open tickets */}
                  {openTickets.length > 0 && (
                    <>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#516469' }}>
                        OPEN ({openTickets.length})
                      </p>
                      <div className="space-y-2 mb-4">
                        {openTickets.map(ticket => {
                          const pStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
                          const sStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
                          const msgCount = (ticket.messages || []).length;
                          const hasUnread = msgCount > 0 && (ticket.messages || []).some(m => m.from === 'superadmin');

                          return (
                            <div
                              key={ticket.id}
                              onClick={() => { setSelectedTicket(ticket); setView('detail'); }}
                              className="flex items-center gap-3 p-3 rounded cursor-pointer hover:shadow transition-shadow"
                              style={{
                                backgroundColor: '#F7FAFC',
                                border: '1px solid #E2E8F0',
                                borderLeft: `4px solid ${pStyle.text}`,
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate" style={{ color: '#071D39' }}>{ticket.subject}</span>
                                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0" style={{ backgroundColor: sStyle.bg, color: sStyle.text }}>{sStyle.label}</span>
                                </div>
                                <span className="text-xs" style={{ color: '#89A8B1' }}>{formatDate(ticket.createdAt)}</span>
                              </div>
                              {hasUnread && (
                                <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} title="New reply" />
                              )}
                              {msgCount > 0 && (
                                <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: '#89A8B1' }}>
                                  <MessageSquare className="w-3 h-3" />{msgCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Resolved tickets */}
                  {resolvedTickets.length > 0 && (
                    <>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#89A8B1' }}>
                        RESOLVED ({resolvedTickets.length})
                      </p>
                      <div className="space-y-2">
                        {resolvedTickets.map(ticket => {
                          const msgCount = (ticket.messages || []).length;
                          return (
                            <div
                              key={ticket.id}
                              onClick={() => { setSelectedTicket(ticket); setView('detail'); }}
                              className="flex items-center gap-3 p-3 rounded cursor-pointer hover:shadow transition-shadow"
                              style={{
                                backgroundColor: '#F9FAFB',
                                border: '1px solid #E2E8F0',
                                borderLeft: '4px solid #86EFAC',
                                opacity: 0.7,
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-sm truncate" style={{ color: '#516469' }}>{ticket.subject}</span>
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>Resolved</span>
                              </div>
                              {msgCount > 0 && (
                                <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: '#89A8B1' }}>
                                  <MessageSquare className="w-3 h-3" />{msgCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---- DETAIL VIEW ---- */}
          {view === 'detail' && selectedTicket && (
            <div className="p-4">
              <button
                onClick={() => { setView('list'); setSelectedTicket(null); setReplyText(''); }}
                className="flex items-center gap-1 text-sm font-semibold mb-3"
                style={{ color: '#516469' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* Ticket info */}
              <div className="mb-4">
                <h3 className="font-bold" style={{ color: '#071D39' }}>{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: (PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).bg,
                      color: (PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).text,
                    }}>
                    {(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).label}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: (STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.open).bg,
                      color: (STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.open).text,
                    }}>
                    {(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.open).label}
                  </span>
                  <span className="text-xs" style={{ color: '#89A8B1' }}>{formatDate(selectedTicket.createdAt)}</span>
                </div>
              </div>

              {/* Original description */}
              <div className="p-3 rounded mb-4 text-sm" style={{ backgroundColor: '#F0F4F5', color: '#071D39' }}>
                {selectedTicket.description}
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4">
                {(selectedTicket.messages || []).length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: '#89A8B1' }}>
                    No replies yet — our team will respond soon.
                  </p>
                ) : (
                  (selectedTicket.messages || []).map((msg, idx) => {
                    const isSA = msg.from === 'superadmin';
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded"
                        style={{
                          backgroundColor: isSA ? '#071D39' : '#F0F4F5',
                          marginLeft: isSA ? '30px' : '0',
                          marginRight: isSA ? '0' : '30px',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: isSA ? '#89A8B1' : '#516469' }}>
                            {isSA ? 'Support Team' : msg.fromName || 'You'}
                          </span>
                          <span className="text-xs" style={{ color: '#89A8B1' }}>{formatDate(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm" style={{ color: isSA ? '#FFFFFF' : '#071D39' }}>{msg.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply box (only if not resolved) */}
              {selectedTicket.status !== 'resolved' && (
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply..."
                    rows={2}
                    className="flex-1 p-2 rounded border text-sm"
                    style={{ borderColor: '#89A8B1', color: '#071D39' }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-3 py-2 rounded text-sm font-semibold text-white flex items-center gap-1 self-end"
                    style={{
                      backgroundColor: sending || !replyText.trim() ? '#89A8B1' : '#071D39',
                      cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              )}

              {selectedTicket.status === 'resolved' && (
                <p className="text-sm text-center py-2" style={{ color: '#89A8B1' }}>
                  This ticket has been resolved. Submit a new ticket if you need more help.
                </p>
              )}
            </div>
          )}

          {/* ---- NEW TICKET VIEW ---- */}
          {view === 'new' && (
            <div className="p-4 space-y-4">
              <button
                onClick={() => { setView('list'); setError(''); }}
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: '#516469' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {error && (
                <div className="p-3 rounded text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full p-2 rounded border text-sm"
                  style={{ borderColor: '#89A8B1', color: '#071D39' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 rounded border text-sm"
                  style={{ borderColor: '#89A8B1', color: '#071D39' }}
                >
                  <option value="low">Low — General question</option>
                  <option value="medium">Medium — Something isn't working right</option>
                  <option value="high">High — Urgent / can't use the app</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what's going on. The more detail, the faster we can help."
                  rows={5}
                  className="w-full p-2 rounded border text-sm"
                  style={{ borderColor: '#89A8B1', color: '#071D39' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setView('list'); setError(''); }}
                  className="px-4 py-2 rounded text-sm font-semibold border"
                  style={{ borderColor: '#516469', color: '#516469' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTicket}
                  disabled={submitting}
                  className="px-4 py-2 rounded text-sm font-semibold text-white"
                  style={{
                    backgroundColor: submitting ? '#89A8B1' : '#071D39',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SupportPanel;
