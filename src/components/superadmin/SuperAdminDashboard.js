import React, { useState, useEffect } from 'react';
import {
  Activity, HeadphonesIcon, BarChart3, UserCheck, Users, Building2,
  CreditCard, Clock, TrendingUp, AlertTriangle, RefreshCw, Eye, ChevronDown, ChevronRight
} from 'lucide-react';
import {
  getAllUsers, getAllOrganizations, getOrgMembers
} from '../../services/superAdminService';

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
        {activeTab === 'support' && <SupportPlaceholder />}
        {activeTab === 'kpis' && <KPIsPlaceholder />}
        {activeTab === 'impersonation' && <ImpersonationPanel onImpersonate={onImpersonate} />}
      </div>
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

    // Load members if not already loaded
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
              {/* Org Row */}
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

              {/* Members List */}
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
// PLACEHOLDER COMPONENTS (Phases 4b, 4c)
// ============================================

const SupportPlaceholder = () => (
  <div className="bg-white rounded-lg shadow p-8 text-center">
    <HeadphonesIcon className="w-12 h-12 mx-auto mb-4" style={{ color: '#89A8B1' }} />
    <h2 className="text-lg font-bold mb-2" style={{ color: '#071D39' }}>Support Hub</h2>
    <p style={{ color: '#516469' }}>
      Client ticket queue, reply threads, status management, and priority filtering.
    </p>
    <p className="text-sm mt-4" style={{ color: '#89A8B1' }}>Coming in Phase 4b</p>
  </div>
);

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
