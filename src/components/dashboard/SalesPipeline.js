import React from 'react';

const SalesPipeline = ({ projects, getDealTitle }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '' || isNaN(value)) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  const calculateCommission = (deal) => {
    const contractPrice = parseFloat(deal.contractPrice) || 0;
    const commissionPercent = parseFloat(deal.commissionPercent) || 0;
    return contractPrice * (commissionPercent / 100);
  };

  const calculateBrokerSplit = (deal) => {
    const commission = calculateCommission(deal);
    const brokerSplitValue = parseFloat(deal.brokerSplitValue) || 0;
    
    if (deal.brokerSplitType === 'flat') {
      return brokerSplitValue;
    }
    return commission * (brokerSplitValue / 100);
  };

  const calculateNet = (deal) => {
    const commission = calculateCommission(deal);
    const brokerSplit = calculateBrokerSplit(deal);
    const transactionFee = parseFloat(deal.transactionFee) || 0;
    const tcFee = parseFloat(deal.tcFee) || 0;
    return commission - brokerSplit - transactionFee - tcFee;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#071D39' }}>Sales Pipeline</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: '#071D39', color: '#FFFFFF' }}>
              <th className="border p-3 text-left font-semibold">Type</th>
              <th className="border p-3 text-left font-semibold">Client Name</th>
              <th className="border p-3 text-right font-semibold">List Price</th>
              <th className="border p-3 text-right font-semibold">Contract Price</th>
              <th className="border p-3 text-right font-semibold">Commission ($)</th>
              <th className="border p-3 text-center font-semibold">Broker Split</th>
              <th className="border p-3 text-right font-semibold">Transaction Fee</th>
              <th className="border p-3 text-right font-semibold">TC Fee</th>
              <th className="border p-3 text-right font-semibold">Net ($)</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="9" className="border p-8 text-center" style={{ color: '#516469' }}>
                  No active deals. Create a new deal to get started.
                </td>
              </tr>
            ) : (
              projects.map((deal, idx) => (
                <tr 
                  key={deal.id} 
                  style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}
                  className="hover:bg-blue-50"
                >
                  <td className="border p-3">
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ 
                        backgroundColor: deal.type === 'Buyer' ? '#DBEAFE' : '#FEF3C7',
                        color: deal.type === 'Buyer' ? '#1D4ED8' : '#92400E'
                      }}
                    >
                      {deal.type}
                    </span>
                  </td>
                  <td className="border p-3 font-medium" style={{ color: '#071D39' }}>
                    {deal.clientName || '—'}
                  </td>
                  <td className="border p-3 text-right" style={{ color: '#516469' }}>
                    {formatCurrency(deal.listPrice)}
                  </td>
                  <td className="border p-3 text-right" style={{ color: '#516469' }}>
                    {formatCurrency(deal.contractPrice)}
                  </td>
                  <td className="border p-3 text-right font-medium" style={{ color: '#059669' }}>
                    {formatCurrency(calculateCommission(deal))}
                  </td>
                  <td className="border p-3 text-right" style={{ color: '#516469' }}>
                    {formatCurrency(calculateBrokerSplit(deal))}
                  </td>
                  <td className="border p-3 text-right" style={{ color: '#516469' }}>
                    {formatCurrency(deal.transactionFee)}
                  </td>
                  <td className="border p-3 text-right" style={{ color: '#516469' }}>
                    {formatCurrency(deal.tcFee)}
                  </td>
                  <td className="border p-3 text-right font-bold" style={{ color: '#071D39' }}>
                    {formatCurrency(calculateNet(deal))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesPipeline;
