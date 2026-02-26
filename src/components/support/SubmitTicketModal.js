import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createTicket } from '../../services/supportTicketService';

const SubmitTicketModal = ({ user, orgId, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your issue.');
      return;
    }

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
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4"
        style={{ border: '2px solid #89A8B1' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg"
          style={{ backgroundColor: '#071D39' }}
        >
          <h2 className="text-lg font-semibold text-white">Submit a Support Ticket</h2>
          <button onClick={onClose} className="text-white hover:opacity-75">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full p-2 rounded border text-sm"
              style={{ borderColor: '#89A8B1', color: '#071D39' }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Priority
            </label>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#071D39' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what's going on. The more detail, the faster we can help."
              rows={5}
              className="w-full p-2 rounded border text-sm"
              style={{ borderColor: '#89A8B1', color: '#071D39' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t" style={{ borderColor: '#89A8B1' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-semibold border"
            style={{ borderColor: '#516469', color: '#516469' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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
    </div>
  );
};

export default SubmitTicketModal;
