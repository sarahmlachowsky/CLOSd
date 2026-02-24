import React from 'react';

const DealFinancials = ({ selectedProject, updateProject }) => {
  return (
    <div className="mt-4 pt-4 border-t">
      <h3 className="font-semibold text-sm mb-3 tracking-wide" style={{ color: '#071D39' }}>DEAL FINANCIALS</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">List Price:</label>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
            <input type="number" min="0"
              value={selectedProject?.listPrice || ''}
              onChange={(e) => {
                const value = Math.max(0, e.target.value);
                updateProject(selectedProject.id, { listPrice: value });
              }}
              className="w-full p-1.5 pl-6 text-sm border rounded" placeholder="0" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">Contract Price:</label>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
            <input type="number" min="0"
              value={selectedProject?.contractPrice || ''}
              onChange={(e) => {
                const value = Math.max(0, e.target.value);
                updateProject(selectedProject.id, { contractPrice: value });
              }}
              className="w-full p-1.5 pl-6 text-sm border rounded" placeholder="0" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">Commission:</label>
          <div className="relative flex-1">
            <input type="number" min="0" max="100" step="0.1"
              value={selectedProject?.commissionPercent || ''}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, e.target.value));
                updateProject(selectedProject.id, { commissionPercent: value });
              }}
              className="w-full p-1.5 pr-6 text-sm border rounded" placeholder="0" />
            <span className="absolute right-2 top-1.5 text-gray-400 text-sm">%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">Broker Split:</label>
          <select
            value={selectedProject?.brokerSplitType || 'percent'}
            onChange={(e) => updateProject(selectedProject.id, { brokerSplitType: e.target.value })}
            className="p-1.5 text-sm border rounded bg-white">
            <option value="percent">%</option>
            <option value="flat">$</option>
          </select>
          <div className="relative flex-1">
            {selectedProject?.brokerSplitType === 'flat' && (
              <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
            )}
            <input type="number" min="0" step="0.1"
              value={selectedProject?.brokerSplitValue || ''}
              onChange={(e) => {
                const value = Math.max(0, e.target.value);
                updateProject(selectedProject.id, { brokerSplitValue: value });
              }}
              className={`w-full p-1.5 text-sm border rounded ${selectedProject?.brokerSplitType === 'flat' ? 'pl-6' : 'pr-6'}`}
              placeholder="0" />
            {selectedProject?.brokerSplitType !== 'flat' && (
              <span className="absolute right-2 top-1.5 text-gray-400 text-sm">%</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">Transaction Fee:</label>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
            <input type="number" min="0"
              value={selectedProject?.transactionFee || ''}
              onChange={(e) => {
                const value = Math.max(0, e.target.value);
                updateProject(selectedProject.id, { transactionFee: value });
              }}
              className="w-full p-1.5 pl-6 text-sm border rounded" placeholder="0" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 w-28">TC Fee:</label>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
            <input type="number" min="0"
              value={selectedProject?.tcFee || ''}
              onChange={(e) => {
                const value = Math.max(0, e.target.value);
                updateProject(selectedProject.id, { tcFee: value });
              }}
              className="w-full p-1.5 pl-6 text-sm border rounded" placeholder="0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealFinancials;
