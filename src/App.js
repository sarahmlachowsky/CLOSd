import React, { useState, useEffect } from 'react';
import { Plus, X, Home, Calendar, AlertCircle, Edit2, Archive, Users } from 'lucide-react';

const SELLER_TEMPLATE = [
  { theme: "New Lead", group: 1, activities: [
    { name: "Create new contact in CRM w/ info & tags", notes: "Collect name, phone number, email, address" },
    { name: "Add neighborhood using address", notes: "" },
    { name: "Connect to automation workflow", notes: "" },
    { name: "Add DTD2 Hashtag", notes: "" },
    { name: "Use FB to collect info like children's names, birthdays, activities", notes: "" }
  ]},
  { theme: "Lead", group: 2, activities: [
    { name: "Prepare Seller Presentation", notes: "" },
    { name: "Send all comms BEFORE presentation", notes: "" },
    { name: "Complete Seller Net Worksheet", notes: "Seller paid fees: Title fees ie closing, search (~$550)" },
    { name: "Have seller complete intake questionaire", notes: "" },
    { name: "Create folders in OneDrive & Outlook", notes: "" },
    { name: "Create/update row in spreadsheet", notes: "" },
    { name: "Duplicate applicable template tab and rename (Client - Buyer/Seller)", notes: "" }
  ]},
  { theme: "Document Prep", group: 3, activities: [
    { name: "Listing Agreement - Page 1 - Seller Names", notes: "" },
    { name: "Listing Agreement - Page 1 - Enter listing agreement dates", notes: "" },
    { name: "Listing Agreement - Page 1 - Address and Property Tax ID", notes: "" },
    { name: "Listing Agreement - Page 1 - Section 2, Occupancy", notes: "" },
    { name: "Listing Agreement - Page 1 - Section 3, Price/Financing Terms", notes: "" },
    { name: "Listing Agreement - Page 2 - Section 6, Broker Authority", notes: "" },
    { name: "Listing Agreement - Page 2 - Section 6, Broker Authority (Lockbox)", notes: "" },
    { name: "Listing Agreement - Page 3 - Section 8, Compensation", notes: "" },
    { name: "Listing Agreement - Page 3 - Section 10, Compensation", notes: "" },
    { name: "Listing Agreement - Page 3 - Section 12, Conditional Termination", notes: "" },
    { name: "Listing Agreement - Page 4 - Section 15, Add'l Terms", notes: "" },
    { name: "Supra Lockbox Form", notes: "" },
    { name: "Seller Controlled Marketing Disclosure", notes: "" },
    { name: "Create listing agreement and have signed", notes: "" },
    { name: "Prepare Flood Disclosure", notes: "" },
    { name: "Complete HRE Affiliated Business Arrangement", notes: "" },
    { name: "Create transaction in Dot Loop", notes: "" },
    { name: "Verify Tax info via COJ Property appraiser", notes: "" },
    { name: "Check coastal construction line for Flood Zone", notes: "" },
    { name: "Seller Property Disclosure", notes: "" },
    { name: "HOA Disclosure", notes: "" },
    { name: "Offer Instructions", notes: "" }
  ]},
  { theme: "Listing Prep", group: 4, activities: [
    { name: "Schedule photography", notes: "" },
    { name: "Bring marketing materials to property (can coincide with photography visit)", notes: "" },
    { name: "Ask seller for spare house keys, amenities center (photographer will need)", notes: "" },
    { name: "Lockbox placement", notes: "" },
    { name: "Contact HOA mgmt company (or Seller) and obtain Decs & Covenants", notes: "" },
    { name: "Request copy of Survey from Seller", notes: "" }
  ]},
  { theme: "MLS", group: 5, activities: [
    { name: "Sign placement", notes: "" },
    { name: "Enter property into MLS", notes: "" },
    { name: "Showing Time setup", notes: "" },
    { name: "Send info to Title Company", notes: "" },
    { name: "Send \"Seller Controlled Marketing Disclosure\" to MLS", notes: "" },
    { name: "Download new active listing from MLS", notes: "" },
    { name: "Add HOA Docs to Document section of MLS, OneDrive, & Dot Loop", notes: "" },
    { name: "Upload offer instructions to document section", notes: "" },
    { name: "Upload HOA, CDD (if applicable), Flood Disclosure", notes: "" },
    { name: "Upload HOA decs and covenants", notes: "" },
    { name: "Upload survey to document section", notes: "" },
    { name: "Upload floor plan (if available) to floor plan section", notes: "" },
    { name: "Upload and order all photos into photos section", notes: "" }
  ]},
  { theme: "Active", group: 6, activities: [
    { name: "Change Authorization Form", notes: "" },
    { name: "Update new price/terms on MLS", notes: "" },
    { name: "Request feedback for each Showing / publish to Seller", notes: "" },
    { name: "Publish price change to all agents in HRE via ShowingTime", notes: "" },
    { name: "Run SM posts each day for 3 days in advance of any OH", notes: "" },
    { name: "Create Open House in MLS EACH TIME you hold one", notes: "" }
  ]},
  { theme: "Under Contract", group: 7, activities: [
    { name: "Change Listing to \"Pend\" in MLS", notes: "" },
    { name: "Submit any necessary items to Compliance portal", notes: "" },
    { name: "Submit executed docs to buyer agent", notes: "", daysOffset: 1 },
    { name: "Submit contract and Survey to Title Company", notes: "", daysOffset: 1 },
    { name: "Confirm Inspection date / repair request", notes: "", daysOffset: 5 },
    { name: "Confirm Buyer Appraisal ordered", notes: "", daysOffset: 15 },
    { name: "Confirm Title company is C2C", notes: "" }
  ]},
  { theme: "Pre-close", group: 8, activities: [
    { name: "Submit all final compliance items to portal", notes: "", daysOffset: 15 },
    { name: "Purchase Closing Gift", notes: "" },
    { name: "Collect keys/garage door openers/alarm codes", notes: "" },
    { name: "Confirm all docs submitted for compliance and request DA from broker", notes: "" },
    { name: "Submit DA to Title", notes: "" },
    { name: "Receive CD from Lender/Buyer Agent and Review with Client", notes: "" },
    { name: "Confirm with Seller that title has told them how they expect funds", notes: "" }
  ]},
  { theme: "Closed", group: 9, activities: [
    { name: "Change status in MLS to closed", notes: "" },
    { name: "Submit Closure items to Dot Loop", notes: "" },
    { name: "Email all docs to Client", notes: "" },
    { name: "Ask for a Google Review", notes: "" },
    { name: "Update contact info / create Smart Plan", notes: "" }
  ]}
];

const BUYER_TEMPLATE = [
  { theme: "New Lead", group: 1, activities: [
    { name: "Create new contact in CRM and add info/tags", notes: "Collect name, phone number, email, address" },
    { name: "Add neighborhood using address", notes: "" },
    { name: "Set up on at least one Automated Campaign", notes: "" },
    { name: "Add DTD2 Hashtag", notes: "Use DTD2 naming convention and their last name to create hashtag" },
    { name: "Use FB to collect info like children's names, birthdays, activities", notes: "" }
  ]},
  { theme: "Lead", group: 2, activities: [
    { name: "Prepare Buyer Presentation according to layout in 'Step by Step Guides'", notes: "Will need to draft based on answers we need from client" },
    { name: "Send all comms BEFORE presentation according to 'Step by Step Guides'", notes: "" },
    { name: "Review/Execute Exclusive Transaction Broker Agreement", notes: "Must be done before any houses have been shown" },
    { name: "Add EITHER $250 or $750 HRE broker fee", notes: "If sphere --> $250, if not --> $750. Once we hit 8,900, we are only charged $250 per transaction" },
    { name: "Create Opportunity in Bold Trail", notes: "Create opportunity, complete all contact details and upload the Exclusive Broker Agreement" },
    { name: "Create/update row in spreadsheet", notes: "Located in 'Helpful Info' file" },
    { name: "Duplicate applicable template tab and rename (Client - Buyer/Seller)", notes: "Located in 'Transaction Coordinator' file" },
    { name: "Create folders in OneDrive & Outlook (SRG Email)", notes: "" }
  ]},
  { theme: "Active Showing", group: 3, activities: [
    { name: "Establish lender", notes: "" },
    { name: "Get pre-qualification letter", notes: "" },
    { name: "Provide income/asset documentation", notes: "" },
    { name: "Create MLS subscription based on preferences", notes: "Add buyer as contact in MLS, invite to portal, set the subscription up for Daily delivery" },
    { name: "Schedule showings through ShowingTime", notes: "As properties are found, schedule showing tours in Showing Time via MLS" },
    { name: "Check Documents section and download all applicable files", notes: "" }
  ]},
  { theme: "Offer Prep", group: 4, activities: [
    { name: "Contract - Page 1 - Buyer and Seller Names", notes: "Pull legal names from property records (COJ.net) or refer to Offer Instructions" },
    { name: "Contract - Page 1 - Property Tax ID", notes: "Pull from Tax section in MLS (or COJ.net) - fill in info in Command details section" },
    { name: "Contract - Page 1, Section 1D - Personal Property", notes: "Include any other items the buyer wants" },
    { name: "Contract - Page 1, Section 1E", notes: "Make sure to list any items being excluded per the MLS (if any)" },
    { name: "Contract - Page 1, Section 2a - EMD", notes: "Check 'to be made', input 3 days, enter amt and fill in escrow agent info per Offer Instructions" },
    { name: "Contract - Page 1, Section 2c - Financing", notes: "Balance of financing is PP - EMD (put as % so that never changes)" },
    { name: "Contract - Page 1, Section 2d - Other", notes: "Input % if buyer is getting DPA program" },
    { name: "Contract - Page 1, Section 2e - Balance to Close", notes: "Balance to close is PP - EMD - financing" },
    { name: "Contract - Page 1, Section 3a - Time for Acceptance", notes: "Input 2 days @ 11:59pm from day of offer" },
    { name: "Contract - Page 2, Section 4 - Closing", notes: "Make at least 45 days out if possible" },
    { name: "Contract - Page 2, Section 7 - Assignability", notes: "Select one radio button (usually may NOT assign)" },
    { name: "Contract - Page 2, Section 8 - Financing", notes: "Input # of days per the lender, and select loan type (Conv/FHA/VA, fixed/arm, etc)" },
    { name: "Contract - Page 3, Section 9 - Closing Costs (Seller)", notes: "If asking for seller to pay portion of CC, write 'see additional terms' in 'Other' box" },
    { name: "Contract - Page 3, Section 9 - Closing Costs (Buyer)", notes: "Add transaction fee $199 (or new brokerage fee) into 'Other' section" },
    { name: "Contract - Page 4, Section 9c - Title", notes: "Select button that seller will choose closing agent" },
    { name: "Contract - Page 4, Section 9e - Survey", notes: "Indicate whether buyer requests seller to pay for a home warranty" },
    { name: "Contract - Page 4, Section 9f - Special Assessments", notes: "Select seller will pay prior to closing and buyer will pay after" },
    { name: "Contract - Page 5, Section 12 - Inspection and Right to Cancel", notes: "Default to 15 days but to make offer strong, can be 7-10" },
    { name: "Contract - Page 11, Section 19 - Addenda", notes: "Select all applicable addenda that will accompany the offer (ie HOA (B), FHA (E), V, GG)" },
    { name: "Contract - Page 11, Section 19 - GG Addendum", notes: "Check box GG and include that addendum with all other docs for buyer signature" },
    { name: "Contract - Page 12, Section 20 - Additional Terms (Closing Costs)", notes: "Write 'Seller to contribute xx% toward buyer closing costs and prepaids'" },
    { name: "Contract - Page 12, Section 20 - Additional Terms (Compensation)", notes: "Write buyer compensation contingency clause for Buyer Broker agreement" },
    { name: "Contract - Page 13, Listing Sales Associate", notes: "Input Listing Agent and Broker name in applicable fields" },
    { name: "Prepare HRE Affiliated Business Disclosure", notes: "" },
    { name: "Prepare GG Addendum for Compensation Agreement", notes: "" },
    { name: "Prepare HOA Addendum", notes: "If property is HOA; Use HOA Addendum already signed by sellers" },
    { name: "Prepare Condo Addendum", notes: "If property is Condo; Use Addendum already signed by sellers" },
    { name: "Prepare CDD Addendum", notes: "If property located in CDD; Use Addendum already signed by sellers" },
    { name: "Prepare FHA/VA Addendum", notes: "If buyer doing FHA/VA financing; Use Addendum already signed by sellers" },
    { name: "Prepare Lead Based Paint", notes: "If property was built prior to 1978; Use Addendum already signed by sellers" },
    { name: "Prepare Flood Disclosure", notes: "Seller should provide in Documents section in MLS - if not, prepare and add to pkg" },
    { name: "Review/Request Seller Disclosure", notes: "Pull down from MLS or request from agent - include with docs for buyer to sign" },
    { name: "Send PASA and all addenda to buyer for signature", notes: "Make sure to include all applicable addenda above" },
    { name: "Submit an Offer per instructions", notes: "Add contingencies (inspection, finance)" },
    { name: "Complete Broker Compensation", notes: "Request commission structure from Listing Agent, sign and include with offer" },
    { name: "Look up other agent in MLS to see production", notes: "" },
    { name: "Pull down tax/property records from MLS", notes: "Can find under Tax Info tab on MLS --> Print page" }
  ]},
  { theme: "Under Contract", group: 5, activities: [
    { name: "Create transaction in Dot Loop", notes: "Create an opportunity and fill out all applicable info", daysOffset: 1 },
    { name: "Print/save a copy of MLS", notes: "", daysOffset: 1 },
    { name: "Send Executed Contract & Addenda to Lender", notes: "Send contract/HOA/CDD/FHAVA/GG Rider to lender", daysOffset: 1 },
    { name: "Pull all HOA from MLS or request from agent and/or Title Co", notes: "Ask for Bylaws, Rules & Regs, Decs and Covenants, Articles of Incorporation, YE Financial stmts", daysOffset: 3 },
    { name: "Pull Survey from MLS or request from agent and/or Title Co", notes: "If no survey, advise title company that one will need to be ordered (buyer cost)", daysOffset: 3 },
    { name: "Order WDO / Well Inspections", notes: "Only required if FHA/VA", daysOffset: 5 },
    { name: "Submit EMD to Title company", notes: "", daysOffset: 3 },
    { name: "Schedule Inspection through ShowingTime", notes: "Once inspection has been confirmed, schedule through ST and provide inspector with code", daysOffset: 5 },
    { name: "Inspections - Review and create amendment to contract", notes: "Send repair request along with signed amendment", daysOffset: 10 },
    { name: "Confirm Buyer Appraisal ordered", notes: "Update spreadsheet with date ordered & again when complete", daysOffset: 15 },
    { name: "Confirm Buyer has secured HOI", notes: "Email buyer the Win Mit and 4pt from the inspection for HOI quotes", daysOffset: 15 },
    { name: "Submit all required 'Under Contract' and 'Offer Prep' items to Dot Loop", notes: "Only do once inspections have been completed and repair requests finalized", daysOffset: 15 },
    { name: "Add copy of EMD to Dot Loop", notes: "", daysOffset: 5 },
    { name: "Upload Survey to Dot Loop", notes: "Download from MLS or request from Agent (if no survey, contact Title)", daysOffset: 10 },
    { name: "Confirm Lender is C2C", notes: "This needs to be done at least 1-2 weeks prior to the closing date on contract", daysOffset: 30 }
  ]},
  { theme: "Pre-close", group: 6, activities: [
    { name: "Schedule Walkthrough", notes: "Confirm with buyer and schedule final walkthrough 1-2 days prior to closing" },
    { name: "Purchase Closing Gift", notes: "" },
    { name: "Collect keys/garage door openers/alarm codes", notes: "Confirm with agent that keys/garage door openers/alarm codes will be at closing" },
    { name: "Create offer and submit DA", notes: "Ensure DA request matches compensation agreement" },
    { name: "Confirm Title company is C2C", notes: "Once appraisal and conditions are in, email title to confirm nothing outstanding" },
    { name: "Submit DA & Indicate who's paying Transaction Fee ($250)", notes: "Can combine this task when confirming Title is clear to close" },
    { name: "Receive CD from Lender and Review with Client", notes: "Personally review for E&O and make sure the client understands CTC" },
    { name: "Confirm with Buyer that title has told them how they expect funds", notes: "Title company should tell the client how to bring the money due at closing (ie wire, cashier check, etc)" },
    { name: "Email Utility PDF", notes: "Helpful so the buyers can start making appts to have services turned on" }
  ]},
  { theme: "Closed", group: 7, activities: [
    { name: "Email all docs to Client", notes: "Include contract, appraisal, title (if avail), survey, HOA (if appl)" },
    { name: "Update contact info / create Smart Plan", notes: "Include new address, sale date, and add to Homestead Exemption plan" },
    { name: "Ask for a Google Review", notes: "Provide link and ask them to please provide a review" },
    { name: "Submit Closure items to Dot Loop", notes: "Survey, DA (uploaded by MC), Executed Alta" }
  ]}
];

const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      return null;
    }
  },
  delete: (key) => {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch (error) {
      return null;
    }
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = storage.get('user');
      const projectsData = storage.get('projects');
      const teamData = storage.get('team');
      
      if (userData) setUser(JSON.parse(userData.value));
      if (projectsData) {
        const loadedProjects = JSON.parse(projectsData.value);
        const migratedProjects = loadedProjects.map(p => ({
          ...p,
          status: p.status || 'active'
        }));
        setProjects(migratedProjects);
      }
      if (teamData) setTeamMembers(JSON.parse(teamData.value));
    } catch (error) {
      console.log('Starting fresh');
    }
    setLoading(false);
  };

  const saveUser = async (userData) => {
    try {
      storage.set('user', JSON.stringify(userData));
      setUser(userData);
      
      const teamData = storage.get('team');
      let currentTeam = teamData ? JSON.parse(teamData.value) : [];
      
      const userExists = currentTeam.some(member => member.email === userData.email);
      if (!userExists) {
        const newMember = {
          id: Date.now().toString(),
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          email: userData.email,
          phone: '',
          role: currentTeam.length === 0 ? 'admin' : 'member'
        };
        currentTeam = [...currentTeam, newMember];
        storage.set('team', JSON.stringify(currentTeam));
        setTeamMembers(currentTeam);
      } else {
        setTeamMembers(currentTeam);
      }
    } catch (error) {
      setUser(userData);
    }
  };

  const saveProjects = async (projectsData) => {
    try {
      storage.set('projects', JSON.stringify(projectsData));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error saving');
    }
  };

  const saveTeamMembers = async (teamData) => {
    try {
      storage.set('team', JSON.stringify(teamData));
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error saving team');
    }
  };

  const addTeamMember = async (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      role: memberData.role || 'member',
      notificationPreference: 'email'
    };
    const updated = [...teamMembers, newMember];
    await saveTeamMembers(updated);
  };

  const removeTeamMember = async (memberId) => {
    const updated = teamMembers.filter(m => m.id !== memberId);
    await saveTeamMembers(updated);
  };

  const updateTeamMember = async (memberId, updates) => {
    const updated = teamMembers.map(m => 
      m.id === memberId ? { ...m, ...updates } : m
    );
    await saveTeamMembers(updated);
    
    const updatedMember = updated.find(m => m.id === memberId);
    if (user && updatedMember && user.email === updatedMember.email) {
      const newUser = {
        ...user,
        firstName: updatedMember.firstName,
        lastName: updatedMember.lastName
      };
      setUser(newUser);
      storage.set('user', JSON.stringify(newUser));
    }
  };

  // Helper function to get deal title based on type
  const getDealTitle = (deal) => {
    if (!deal) return '';
    if (deal.type === 'Buyer') {
      return deal.clientName || 'New Buyer Deal';
    }
    return deal.propertyAddress || 'New Seller Deal';
  };

  const isAdmin = () => {
    if (!user || teamMembers.length === 0) return true;
    const currentMember = teamMembers.find(m => m.email === user.email);
    return currentMember?.role === 'admin' || teamMembers[0]?.email === user.email;
  };

  const getCurrentUserMember = () => {
    return teamMembers.find(m => m.email === user?.email);
  };

  const createProject = async (projectData) => {
    // Select template based on deal type
    const template = projectData.type === 'Buyer' ? BUYER_TEMPLATE : SELLER_TEMPLATE;
    
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      status: 'active',
      createdAt: new Date().toISOString(),
      tasks: template.flatMap(themeGroup => 
        themeGroup.activities.map((activity, idx) => ({
          id: `${themeGroup.group}-${idx}`,
          theme: themeGroup.theme,
          name: activity.name,
          notes: activity.notes,
          status: 'not-started',
          dueDate: projectData.contractDate && activity.daysOffset 
            ? calculateDueDate(projectData.contractDate, activity.daysOffset)
            : null,
          userNotes: ''
        }))
      )
    };

    const updated = [...projects, newProject];
    await saveProjects(updated);
    setShowNewProjectModal(false);
    setSelectedProject(newProject);
    setCurrentView('project');
  };

  const updateProject = async (projectId, updates) => {
    const updated = projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    await saveProjects(updated);
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
    
    const updated = projects.filter(p => p.id !== idToDelete);
    await saveProjects(updated);
    setShowDeleteModal(false);
    setDealToDelete(null);
    
    if (selectedProject?.id === idToDelete) {
      setSelectedProject(null);
      setCurrentView('dashboard');
    }
  };

  const calculateDueDate = (startDate, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  const updateTask = async (projectId, taskId, updates) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        };
      }
      return p;
    });
    await saveProjects(updated);
    if (selectedProject?.id === projectId) {
      setSelectedProject(updated.find(p => p.id === projectId));
    }
  };

  const isTaskUrgent = (task) => {
    if (task.status === 'complete') return false;
    if (!task.dueDate) return false;
    const today = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays < 0 || diffDays <= 3;
  };

  const getTaskColor = (task) => {
    // Status-based styling (highest priority for complete)
    if (task.status === 'complete') return 'bg-blue-500 text-white';
    
    // Due date urgency styling (overrides status styling if urgent)
    if (task.dueDate) {
      const today = new Date();
      const due = new Date(task.dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'bg-red-500 text-white';
      if (diffDays <= 3) return 'bg-yellow-400';
    }
    
    // Status-based styling for non-urgent tasks
    const statusStyles = {
      'not-started': 'border-2 border-gray-400 text-white',
      'in-progress': 'bg-white border-2 border-gray-200'
    };
    
    return statusStyles[task.status] || 'bg-gray-200 border-2 border-gray-300';
  };

  const getDueSoonTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p => 
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete') return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  };

  const getOverdueTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p =>
      p.tasks.map(t => ({ ...t, projectName: p.propertyAddress, projectId: p.id, projectClientName: p.clientName, projectType: p.type }))
    );
    return allTasks.filter(t => {
      if (!t.dueDate || t.status === 'complete') return false;
      const today = new Date();
      const due = new Date(t.dueDate);
      return due < today;
    });
  };

  const getMyTasks = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    const allTasks = activeProjects.flatMap(p => 
      p.tasks.map(t => ({ 
        ...t, 
        projectName: p.propertyAddress, 
        projectId: p.id,
        projectClientName: p.clientName,
        projectType: p.type
      }))
    );
    const userFullName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : '';
    
    // Normalize comparison to handle whitespace/case inconsistencies
    const normalizedUserName = userFullName.toLowerCase().trim();
    
    const myTasks = allTasks.filter(t => {
      if (!t.assignedTo) return false;
      const normalizedAssignee = t.assignedTo.toLowerCase().trim();
      const isAssignedToMe = normalizedAssignee === normalizedUserName;
      const isNotComplete = t.status !== 'complete';
      return isAssignedToMe && isNotComplete;
    });
    
    // DEBUG: Uncomment to verify task count matches
    // console.log(`[getMyTasks] User: "${userFullName}", Found ${myTasks.length} tasks:`, myTasks.map(t => ({ id: t.id, name: t.name, status: t.status, assignedTo: t.assignedTo })));
    
    return myTasks;
  };

  // Generic function to group any task list by deal
  const groupTasksByDeal = (tasks) => {
    const grouped = {};
    
    tasks.forEach(task => {
      if (!grouped[task.projectId]) {
        grouped[task.projectId] = {
          projectId: task.projectId,
          projectName: task.projectName,
          projectClientName: task.projectClientName,
          tasks: [],
          taskCount: 0
        };
      }
      grouped[task.projectId].tasks.push(task);
      grouped[task.projectId].taskCount++;
    });
    
    return Object.values(grouped);
  };

  // Grouped task getters for each dashboard board
  const getMyTasksGroupedByDeal = () => groupTasksByDeal(getMyTasks());
  const getOverdueTasksGroupedByDeal = () => groupTasksByDeal(getOverdueTasks());
  const getDueSoonTasksGroupedByDeal = () => groupTasksByDeal(getDueSoonTasks());

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedProject(null);
    setSelectedTask(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={saveUser} />;
  }

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  if (currentView === 'dashboard') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar 
          projects={activeProjects}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setCurrentView('project');
          }}
          onDashboard={() => setCurrentView('dashboard')}
          onArchive={() => setCurrentView('archive')}
          onNewProject={() => setShowNewProjectModal(true)}
          onManageTeam={() => setShowTeamModal(true)}
          onMyProfile={() => {
            const member = getCurrentUserMember();
            if (member) {
              setEditProfileMember(member);
              setEditProfileMode('self');
              setShowEditProfileModal(true);
            }
          }}
          onLogout={handleLogout}
          currentView={currentView}
          getDealTitle={getDealTitle}
        />
        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#071D39' }}>Hello {user.firstName}, let's get to work!</h1>
          <div className="flex flex-col gap-6 mt-8">
            <DashboardCard
              title="Current Deals"
              count={activeProjects.length}
              icon={<Home className="w-6 h-6" />}
              color="blue"
              projects={activeProjects}
              onSelectProject={(p) => {
                setSelectedProject(p);
                setCurrentView('project');
              }}
              getDealTitle={getDealTitle}
            />
            <DashboardCard
              title="Tasks Assigned To Me"
              count={getMyTasks().length}
              icon={<AlertCircle className="w-6 h-6" />}
              color="green"
              groupedDeals={getMyTasksGroupedByDeal()}
              onSelectGroupedDeal={(deal) => {
                setMyTasksModalDeal(deal);
                setMyTasksModalType('assigned');
                setShowMyTasksModal(true);
              }}
              bgTint="#EFF6FF"
            />
            <DashboardCard
              title="Due Within 72 Hours"
              count={getDueSoonTasks().length}
              icon={<Calendar className="w-6 h-6" />}
              color="yellow"
              groupedDeals={getDueSoonTasksGroupedByDeal()}
              onSelectGroupedDeal={(deal) => {
                setMyTasksModalDeal(deal);
                setMyTasksModalType('dueSoon');
                setShowMyTasksModal(true);
              }}
              bgTint="#FFFBEB"
            />
            <DashboardCard
              title="Overdue"
              count={getOverdueTasks().length}
              icon={<AlertCircle className="w-6 h-6" />}
              color="red"
              groupedDeals={getOverdueTasksGroupedByDeal()}
              onSelectGroupedDeal={(deal) => {
                setMyTasksModalDeal(deal);
                setMyTasksModalType('overdue');
                setShowMyTasksModal(true);
              }}
              bgTint="#FEF2F2"
            />
          </div>
        </div>
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onSave={createProject}
          />
        )}
        {showTeamModal && (
          <TeamMemberModal
            onClose={() => setShowTeamModal(false)}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            onEdit={(member) => {
              setEditProfileMember(member);
              setEditProfileMode('admin');
              setShowEditProfileModal(true);
            }}
            teamMembers={teamMembers}
            isAdmin={isAdmin()}
          />
        )}
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember}
            mode={editProfileMode}
            isAdmin={isAdmin()}
            onClose={() => {
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
            onSave={(memberId, updates) => {
              updateTeamMember(memberId, updates);
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
          />
        )}
        {showMyTasksModal && myTasksModalDeal && (
          <MyTasksModal
            deal={myTasksModalDeal}
            modalType={myTasksModalType}
            onClose={() => {
              setShowMyTasksModal(false);
              setMyTasksModalDeal(null);
              setMyTasksModalType('assigned');
            }}
            onTaskClick={(task) => {
              const project = activeProjects.find(p => p.id === task.projectId);
              setTaskDetailTask(task);
              setTaskDetailProject(project);
              setShowTaskDetailModal(true);
            }}
            getTaskColor={getTaskColor}
            isTaskUrgent={isTaskUrgent}
          />
        )}
        {showTaskDetailModal && taskDetailTask && (
          <TaskDetailModal
            task={taskDetailTask}
            project={taskDetailProject}
            teamMembers={teamMembers}
            onClose={() => {
              setShowTaskDetailModal(false);
              setTaskDetailTask(null);
              setTaskDetailProject(null);
            }}
            onUpdate={(updates) => {
              updateTask(taskDetailTask.projectId, taskDetailTask.id, updates);
              if (myTasksModalDeal) {
                const updatedTasks = myTasksModalDeal.tasks.map(t => 
                  t.id === taskDetailTask.id ? { ...t, ...updates } : t
                );
                // Always filter out completed tasks from modal (applies to all modal types)
                if (updates.status === 'complete') {
                  const remainingTasks = updatedTasks.filter(t => t.status !== 'complete');
                  if (remainingTasks.length === 0) {
                    // Close modal if no tasks remain
                    setShowMyTasksModal(false);
                    setMyTasksModalDeal(null);
                    setMyTasksModalType('assigned');
                  } else {
                    setMyTasksModalDeal({
                      ...myTasksModalDeal,
                      tasks: remainingTasks,
                      taskCount: remainingTasks.length
                    });
                  }
                } else {
                  setMyTasksModalDeal({
                    ...myTasksModalDeal,
                    tasks: updatedTasks
                  });
                }
              }
              setShowTaskDetailModal(false);
              setTaskDetailTask(null);
              setTaskDetailProject(null);
            }}
          />
        )}
      </div>
    );
  }

  if (currentView === 'archive') {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <Sidebar 
          projects={activeProjects}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setCurrentView('project');
          }}
          onDashboard={() => setCurrentView('dashboard')}
          onArchive={() => setCurrentView('archive')}
          onNewProject={() => setShowNewProjectModal(true)}
          onManageTeam={() => setShowTeamModal(true)}
          onMyProfile={() => {
            const member = getCurrentUserMember();
            if (member) {
              setEditProfileMember(member);
              setEditProfileMode('self');
              setShowEditProfileModal(true);
            }
          }}
          onLogout={handleLogout}
          currentView={currentView}
          getDealTitle={getDealTitle}
        />
        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#071D39' }}>Deal Archive</h1>
          {archivedProjects.length === 0 ? (
            <p className="text-gray-500">No archived deals</p>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {archivedProjects.map((project) => (
                <div key={project.id} className="p-4 rounded-lg border-2 w-full" style={{ borderColor: '#89A8B1', backgroundColor: '#F5F5F5' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg mb-2" style={{ color: '#071D39' }}>{project.propertyAddress}</h3>
                      <p className="text-sm mb-1" style={{ color: '#516469' }}>Client: {project.clientName}</p>
                      <p className="text-sm mb-3" style={{ color: '#516469' }}>Type: {project.type}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDealToDelete(project);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1 rounded font-semibold text-sm"
                      style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => unarchiveProject(project.id)}
                    className="px-4 py-2 rounded font-semibold text-sm"
                    style={{ backgroundColor: '#516469', color: '#FFFFFF' }}
                  >
                    Restore to Active
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {showNewProjectModal && (
          <NewProjectModal
            onClose={() => setShowNewProjectModal(false)}
            onSave={createProject}
          />
        )}
        {showTeamModal && (
          <TeamMemberModal
            onClose={() => setShowTeamModal(false)}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            onEdit={(member) => {
              setEditProfileMember(member);
              setEditProfileMode('admin');
              setShowEditProfileModal(true);
            }}
            teamMembers={teamMembers}
            isAdmin={isAdmin()}
          />
        )}
        {showDeleteModal && dealToDelete && (
          <DeleteConfirmModal
            projectAddress={dealToDelete.propertyAddress}
            onConfirm={() => deleteProject(dealToDelete.id)}
            onCancel={() => {
              setShowDeleteModal(false);
              setDealToDelete(null);
            }}
          />
        )}
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember}
            mode={editProfileMode}
            isAdmin={isAdmin()}
            onClose={() => {
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
            onSave={(memberId, updates) => {
              updateTeamMember(memberId, updates);
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
          projects={activeProjects}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setCurrentView('project');
          }}
          onDashboard={() => setCurrentView('dashboard')}
          onArchive={() => setCurrentView('archive')}
          onNewProject={() => setShowNewProjectModal(true)}
          onManageTeam={() => setShowTeamModal(true)}
          onMyProfile={() => {
            const member = getCurrentUserMember();
            if (member) {
              setEditProfileMember(member);
              setEditProfileMode('self');
              setShowEditProfileModal(true);
            }
          }}
          onLogout={handleLogout}
          currentView={currentView}
          getDealTitle={getDealTitle}
        />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{getDealTitle(selectedProject)}</h2>
              <button
                onClick={() => setShowEditProjectModal(true)}
                className="p-2 hover:bg-gray-100 rounded"
                title="Edit deal details"
              >
                <Edit2 className="w-5 h-5" style={{ color: '#516469' }} />
              </button>
            </div>
            {selectedProject?.status === 'archived' ? (
              <button
                onClick={() => {
                  setDealToDelete(selectedProject);
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ 
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '2px solid #FCA5A5'
                }}
              >
                <X className="w-4 h-4" />
                Delete Deal
              </button>
            ) : (
              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-4 py-2 rounded font-semibold flex items-center gap-2"
                style={{ 
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '2px solid #FCD34D'
                }}
              >
                <Archive className="w-4 h-4" />
                Archive Deal
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Client:</span> <span className="font-medium">{selectedProject?.clientName}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span> <span className="font-medium">{selectedProject?.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedProject?.phone || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span> <span className="font-medium">{selectedProject?.email || 'Not provided'}</span>
            </div>
            {selectedProject?.contractDate && (
              <div>
                <span className="text-gray-500">Under Contract Date:</span> <span className="font-medium">{selectedProject?.contractDate}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <KanbanBoard 
            project={selectedProject}
            onTaskClick={setSelectedTask}
            getTaskColor={getTaskColor}
            isTaskUrgent={isTaskUrgent}
          />
        </div>
      </div>
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          project={selectedProject}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => updateTask(selectedProject.id, selectedTask.id, updates)}
        />
      )}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSave={createProject}
        />
      )}
      {showTeamModal && (
          <TeamMemberModal
            onClose={() => setShowTeamModal(false)}
            onAdd={addTeamMember}
            onRemove={removeTeamMember}
            onEdit={(member) => {
              setEditProfileMember(member);
              setEditProfileMode('admin');
              setShowEditProfileModal(true);
            }}
            teamMembers={teamMembers}
            isAdmin={isAdmin()}
          />
        )}
        {showEditProfileModal && editProfileMember && (
          <EditProfileModal
            member={editProfileMember}
            mode={editProfileMode}
            isAdmin={isAdmin()}
            onClose={() => {
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
            onSave={(memberId, updates) => {
              updateTeamMember(memberId, updates);
              setShowEditProfileModal(false);
              setEditProfileMember(null);
            }}
          />
        )}
      {showArchiveModal && (
        <ArchiveConfirmModal
          projectAddress={selectedProject?.propertyAddress}
          onConfirm={archiveProject}
          onCancel={() => setShowArchiveModal(false)}
        />
      )}
      {showDeleteModal && dealToDelete && (
        <DeleteConfirmModal
          projectAddress={dealToDelete.propertyAddress}
          onConfirm={() => deleteProject(dealToDelete.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setDealToDelete(null);
          }}
        />
      )}
      {showEditProjectModal && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setShowEditProjectModal(false)}
          onSave={(updates) => {
            updateProject(selectedProject.id, updates);
            setShowEditProjectModal(false);
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          projectAddress={selectedProject?.propertyAddress}
          onConfirm={deleteProject}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = () => {
    if (email && password && firstName) {
      onLogin({ email, firstName, lastName });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(to bottom right, #071D39, #516469)' }}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img 
              src="/closd-logo.png" 
              alt="CLOSD Logo" 
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full p-3 border rounded"
            style={{ borderColor: '#89A8B1' }}
          />
          <button
            onClick={handleSubmit}
            className="w-full text-white p-3 rounded font-semibold"
            style={{ backgroundColor: '#516469' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ projects, onSelectProject, onDashboard, onArchive, onNewProject, onManageTeam, onMyProfile, currentView, selectedProjectId, onLogout, getDealTitle }) => {
  return (
    <div className="w-64 border-r flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#89A8B1' }}>
      <div className="p-4 border-b flex items-center justify-center" style={{ backgroundColor: '#071D39', borderColor: '#071D39' }}>
        <div className="text-center w-full">
          <img 
            src="/closd-logo.png" 
            alt="CLOSD Logo" 
            className="h-16 w-auto mx-auto object-contain"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <button
          onClick={onDashboard}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ 
            backgroundColor: currentView === 'dashboard' ? '#89A8B1' : 'transparent',
            color: currentView === 'dashboard' ? '#071D39' : '#516469'
          }}
        >
          <Home className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={onManageTeam}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ color: '#516469' }}
        >
          <Users className="w-5 h-5" />
          Manage Team
        </button>
        <button
          onClick={onMyProfile}
          className="w-full text-left p-4 flex items-center gap-2"
          style={{ color: '#516469' }}
        >
          <Edit2 className="w-5 h-5" />
          My Profile
        </button>
        <div className="p-4 text-sm font-semibold" style={{ color: '#516469' }}>ACTIVE DEALS</div>
        
        {/* Sellers Section */}
        {projects.filter(p => p.type === 'Seller').length > 0 && (
          <>
            <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#89A8B1' }}>
              Sellers
            </div>
            {projects.filter(p => p.type === 'Seller').map((project) => (
              <div key={project.id} className="mx-3 mb-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="w-full text-left px-3 py-1 rounded border-l-4"
                  style={{
                    borderLeftColor: selectedProjectId === project.id ? '#516469' : '#89A8B1',
                    backgroundColor: selectedProjectId === project.id ? '#89A8B1' : '#F5F5F5',
                    border: '2px solid #89A8B1'
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.propertyAddress}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.clientName}</div>
                </button>
              </div>
            ))}
          </>
        )}
        
        {/* Buyers Section */}
        {projects.filter(p => p.type === 'Buyer').length > 0 && (
          <>
            <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: '#89A8B1' }}>
              Buyers
            </div>
            {projects.filter(p => p.type === 'Buyer').map((project) => (
              <div key={project.id} className="mx-3 mb-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="w-full text-left px-3 py-1 rounded border-l-4"
                  style={{
                    borderLeftColor: selectedProjectId === project.id ? '#516469' : '#89A8B1',
                    backgroundColor: selectedProjectId === project.id ? '#89A8B1' : '#F5F5F5',
                    border: '2px solid #89A8B1'
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.clientName}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.propertyAddress || 'No property yet'}</div>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      <button
        onClick={onArchive}
        className="mx-4 mb-2 p-3 rounded font-semibold flex items-center justify-center gap-2"
        style={{ 
          backgroundColor: currentView === 'archive' ? '#89A8B1' : 'transparent',
          color: currentView === 'archive' ? '#071D39' : '#516469',
          border: '2px solid #89A8B1'
        }}
      >
        <Archive className="w-5 h-5" />
        Deal Archive
      </button>
      <button
        onClick={onNewProject}
        className="mx-4 mb-4 text-white p-3 rounded font-semibold flex items-center justify-center gap-2"
        style={{ backgroundColor: '#516469' }}
      >
        <Plus className="w-5 h-5" />
        New Deal
      </button>
      {onLogout && (
        <button
          onClick={onLogout}
          className="mx-4 mb-4 p-3 rounded font-semibold border-2"
          style={{ borderColor: '#516469', color: '#516469', backgroundColor: 'transparent' }}
        >
          Logout
        </button>
      )}
    </div>
  );
};

const DashboardCard = ({ title, count, icon, color, tasks, projects, onSelectProject, allProjects, groupedDeals, onSelectGroupedDeal, bgTint, getDealTitle }) => {
  const colors = {
    blue: { bg: '#89A8B1', text: '#071D39' },
    yellow: { bg: '#FFC107', text: '#000000' },
    red: { bg: '#EF4444', text: '#FFFFFF' },
    green: { bg: '#10B981', text: '#FFFFFF' }
  };

  const handleProjectClick = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  const handleTaskClick = (task) => {
    if (onSelectProject && allProjects) {
      const project = allProjects.find(p => p.id === task.projectId);
      if (project) {
        onSelectProject(project);
      }
    }
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const handleGroupedDealClick = (deal) => {
    if (onSelectGroupedDeal) {
      onSelectGroupedDeal(deal);
    }
  };

  return (
    <div className="p-6 rounded-lg shadow" style={{ backgroundColor: bgTint || '#FFFFFF', border: '1px solid #89A8B1' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#071D39' }}>{title}</h3>
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors[color].bg, color: colors[color].text }}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold mb-4" style={{ color: '#516469' }}>{count}</div>
      {projects && projects.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {projects.map((project, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleProjectClick(project)}
              onKeyDown={(e) => handleKeyDown(e, () => handleProjectClick(project))}
              tabIndex={0}
              role="button"
              aria-label={`Open deal: ${project.propertyAddress}`}
            >
              <div className="font-medium" style={{ color: '#071D39' }}>{getDealTitle ? getDealTitle(project) : project.propertyAddress}</div>
                  <div className="text-xs" style={{ color: '#516469' }}>{project.type === 'Buyer' ? (project.propertyAddress || 'No property yet') : project.clientName}</div>
            </div>
          ))}
        </div>
      )}
      {groupedDeals && groupedDeals.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {groupedDeals.map((deal, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleGroupedDealClick(deal)}
              onKeyDown={(e) => handleKeyDown(e, () => handleGroupedDealClick(deal))}
              tabIndex={0}
              role="button"
              aria-label={`View ${deal.taskCount} tasks in ${deal.projectName}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium" style={{ color: '#071D39' }}>{deal.projectType === 'Buyer' ? (deal.projectClientName || 'New Buyer Deal') : deal.projectName}</div>
                <div className="text-xs" style={{ color: '#516469' }}>{deal.projectType === 'Buyer' ? (deal.projectName || 'No property yet') : deal.projectClientName}</div>
              </div>
              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                {deal.taskCount} {deal.taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          ))}
        </div>
      )}
      {tasks && tasks.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-auto">
          {tasks.map((task, idx) => (
            <div 
              key={idx} 
              className="text-sm p-2 rounded cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
              style={{ backgroundColor: '#F5F5F5', border: '2px solid #89A8B1' }}
              onClick={() => handleTaskClick(task)}
              onKeyDown={(e) => handleKeyDown(e, () => handleTaskClick(task))}
              tabIndex={0}
              role="button"
              aria-label={`Open task: ${task.name} in ${task.projectName}`}
            >
              <div className="font-medium truncate" style={{ color: '#071D39' }}>{task.name}</div>
              <div className="text-xs" style={{ color: '#516469' }}>{task.projectName}</div>
              {task.dueDate && <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KanbanBoard = ({ project, onTaskClick, getTaskColor, isTaskUrgent }) => {
  const themes = [...new Set(project.tasks.map(t => t.theme))];

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getUserColor = (name) => {
    if (!name) return '#516469';
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#14B8A6', '#EF4444', '#6366F1'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex gap-4 h-full items-start">
      {themes.map((theme, themeIdx) => (
        <div key={themeIdx} className="flex-shrink-0 w-80 rounded-lg p-4 flex flex-col" style={{ backgroundColor: '#F5F5F5', border: '1px solid #89A8B1', minHeight: 'fit-content' }}>
          <h3 className="font-bold mb-4" style={{ color: '#071D39' }}>{theme}</h3>
          <div className="space-y-3 flex-1">
            {project.tasks
              .filter(t => t.theme === theme)
              .map((task, taskIdx) => (
                <div
                  key={taskIdx}
                  onClick={() => onTaskClick(task)}
                  className={`${getTaskColor(task)} p-3 rounded cursor-pointer hover:shadow-lg transition-shadow`}
                  style={{ 
                    border: '1px solid #89A8B1',
                    backgroundColor: task.status === 'not-started' && !isTaskUrgent(task) ? '#8C8C8C' : undefined
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-2" style={{ color: '#000000' }}>{task.name}</div>
                      {task.dueDate && (
                        <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>
                      )}
                    </div>
                    {task.assignedTo && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: getUserColor(task.assignedTo), color: '#FFFFFF' }}>
                        {getInitials(task.assignedTo)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TaskDetailPanel = ({ task, project, onClose, onUpdate, teamMembers }) => {
  const [userNotes, setUserNotes] = useState(task.userNotes || '');
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const handleSave = () => {
    onUpdate({ userNotes, status, assignedTo });
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l flex flex-col z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-lg">Task Details</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Task Name</label>
          <div className="text-gray-700">{task.name}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Assigned To</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={`${member.firstName} ${member.lastName}`}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        {task.dueDate && (
          <div>
            <label className="block text-sm font-semibold mb-2">Due Date</label>
            <div className="text-gray-700">{task.dueDate}</div>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold mb-2">Instructions</label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{task.notes || 'No instructions provided'}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Your Notes</label>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Add your notes here..."
          />
        </div>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const NewProjectModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: 'Seller',
    clientName: '',
    phone: '',
    email: '',
    propertyAddress: '',
    contractDate: ''
  });

  const handleSubmit = () => {
    if (formData.clientName && formData.propertyAddress) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Deal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Deal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border rounded"
            >
              <option>Seller</option>
              <option>Buyer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Client Name(s)</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="John and Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number(s)</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="555-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address(es)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="client@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Property Address</label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="123 Main St, Jacksonville, FL"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Under Contract Date</label>
            <input
              type="date"
              value={formData.contractDate}
              onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
              className="w-full p-3 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank if not yet under contract</p>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            Create Deal
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    type: project.type,
    clientName: project.clientName,
    phone: project.phone || '',
    email: project.email || '',
    propertyAddress: project.propertyAddress,
    contractDate: project.contractDate || ''
  });

  const handleSubmit = () => {
    if (formData.clientName && formData.propertyAddress) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Deal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Deal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border rounded"
            >
              <option>Seller</option>
              <option>Buyer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Client Name(s)</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="John and Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone Number(s)</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="555-1234"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address(es)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="client@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Property Address</label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
              className="w-full p-3 border rounded"
              placeholder="123 Main St, Jacksonville, FL"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Under Contract Date</label>
            <input
              type="date"
              value={formData.contractDate}
              onChange={(e) => setFormData({...formData, contractDate: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded font-semibold border-2"
              style={{ borderColor: '#89A8B1', color: '#516469' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamMemberModal = ({ onClose, onAdd, onRemove, onEdit, teamMembers, isAdmin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'member'
  });

  const handleSubmit = () => {
    if (formData.firstName && formData.lastName && formData.email) {
      onAdd(formData);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'member' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-screen overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Manage Team</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Add New Team Member</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="p-3 border rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="p-3 border rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="p-3 border rounded"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Add Team Member
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Current Team Members</h3>
          {teamMembers.length === 0 ? (
            <p className="text-gray-500 text-sm">No team members added yet</p>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {member.firstName} {member.lastName}
                      {member.role === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                    {member.phone && <div className="text-sm text-gray-600">{member.phone}</div>}
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => onEdit(member)}
                        className="px-3 py-1 text-sm rounded font-semibold"
                        style={{ backgroundColor: '#E0E7FF', color: '#3730A3' }}
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => onRemove(member.id)}
                        className="px-3 py-1 text-sm rounded font-semibold"
                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ projectAddress, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Deal Permanently?</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to permanently delete <strong>{projectAddress}</strong>? This will remove the deal and all its tasks. This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '2px solid #D1D5DB'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              border: '2px solid #DC2626'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ArchiveConfirmModal = ({ projectAddress, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#92400E' }}>Archive This Deal?</h2>
        <p className="mb-6 text-gray-700">
          Archive the deal for <strong>{projectAddress}</strong>? You can restore it from the Deal Archive later.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '2px solid #D1D5DB'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded font-semibold"
            style={{ 
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              border: '2px solid #D97706'
            }}
          >
            Archive Deal
          </button>
        </div>
      </div>
    </div>
  );
};

const MyTasksModal = ({ deal, onClose, onTaskClick, getTaskColor, isTaskUrgent, modalType = 'assigned' }) => {
  const themeOrder = [
    "New Lead", "Lead", "Document Prep", "Listing Prep", "MLS", 
    "Active", "Under Contract", "Pre-close", "Closed",
    "Active Showing", "Offer Prep"
  ];
  
  const tasksByTheme = {};
  deal.tasks.forEach(task => {
    if (!tasksByTheme[task.theme]) {
      tasksByTheme[task.theme] = [];
    }
    tasksByTheme[task.theme].push(task);
  });

  const activeThemes = themeOrder.filter(theme => tasksByTheme[theme] && tasksByTheme[theme].length > 0);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-tasks-modal-title"
    >
      <div 
        id="my-tasks-modal"
        className="bg-white rounded-lg shadow-2xl w-11/12 max-w-6xl max-h-[85vh] flex flex-col"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 id="my-tasks-modal-title" className="text-xl font-bold" style={{ color: '#071D39' }}>
              {modalType === 'overdue' && `Overdue Tasks: ${deal.projectName}`}
              {modalType === 'dueSoon' && `Due Soon: ${deal.projectName}`}
              {modalType === 'assigned' && `My Tasks: ${deal.projectName}`}
            </h2>
            <p className="text-sm" style={{ color: '#516469' }}>
              {deal.taskCount} {deal.taskCount === 1 ? 'task' : 'tasks'}
              {modalType === 'overdue' && ' overdue'}
              {modalType === 'dueSoon' && ' due within 72 hours'}
              {modalType === 'assigned' && ' assigned to you'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <div className="flex gap-4 min-h-full">
            {activeThemes.map((theme, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-72 rounded-lg p-4 flex flex-col"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #89A8B1' }}
              >
                <h3 className="font-bold mb-4 text-sm" style={{ color: '#071D39' }}>
                  {theme}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#89A8B1', color: '#071D39' }}>
                    {tasksByTheme[theme].length}
                  </span>
                </h3>
                <div className="space-y-3 flex-1">
                  {tasksByTheme[theme].map((task, taskIdx) => (
                    <div
                      key={taskIdx}
                      onClick={() => onTaskClick(task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onTaskClick(task);
                        }
                      }}
                      className={`${getTaskColor(task)} p-3 rounded cursor-pointer hover:shadow-lg transition-shadow`}
                      style={{ 
                        border: '1px solid #89A8B1',
                        backgroundColor: task.status === 'not-started' && !isTaskUrgent(task) ? '#8C8C8C' : undefined
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open task: ${task.name}`}
                    >
                      <div className="font-medium text-sm mb-1">{task.name}</div>
                      {task.dueDate && (
                        <div className="text-xs" style={{ color: '#516469' }}>Due: {task.dueDate}</div>
                      )}
                      <div className="text-xs mt-1 capitalize" style={{ color: '#516469' }}>
                        Status: {task.status.replace('-', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskDetailModal = ({ task, project, teamMembers, onClose, onUpdate }) => {
  const [userNotes, setUserNotes] = useState(task.userNotes || '');
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const handleSave = () => {
    onUpdate({ userNotes, status, assignedTo });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-modal-title"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 id="task-detail-modal-title" className="font-bold text-lg">Task Details</h3>
            <p className="text-sm" style={{ color: '#516469' }}>{project?.propertyAddress}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close task details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Task Name</label>
            <div className="text-gray-700">{task.name}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Theme/Stage</label>
            <div className="text-gray-700">{task.theme}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={`${member.firstName} ${member.lastName}`}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          {task.dueDate && (
            <div>
              <label className="block text-sm font-semibold mb-2">Due Date</label>
              <div className="text-gray-700">{task.dueDate}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Instructions</label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{task.notes || 'No instructions provided'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Your Notes</label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full p-2 border rounded h-32"
              placeholder="Add your notes here..."
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded font-semibold border-2"
            style={{ borderColor: '#89A8B1', color: '#516469' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ member, mode, onClose, onSave, isAdmin }) => {
  const [formData, setFormData] = useState({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || 'member',
    notificationPreference: member.notificationPreference || 'email'
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if ((formData.notificationPreference === 'sms' || formData.notificationPreference === 'both') && !formData.phone.trim()) {
      newErrors.notificationPreference = 'Phone number is required for SMS notifications';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const updates = { ...formData };
      if (!isAdmin || mode === 'self') delete updates.role;
      delete updates.email;
      // Always include notificationPreference
      updates.notificationPreference = formData.notificationPreference;
      onSave(member.id, updates);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#071D39' }}>
            {mode === 'self' ? 'My Profile' : 'Edit Team Member'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`w-full p-3 border rounded ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`w-full p-3 border rounded ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              className="w-full p-3 border rounded bg-gray-100"
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            {isAdmin && mode === 'admin' ? (
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 border rounded"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <div className="w-full p-3 border rounded bg-gray-100 text-gray-600">
                {formData.role === 'admin' ? 'Admin' : 'Member'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Notification Preferences</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="email"
                  checked={formData.notificationPreference === 'email'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>Email only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="sms"
                  checked={formData.notificationPreference === 'sms'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>SMS only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="both"
                  checked={formData.notificationPreference === 'both'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>Both (Email + SMS)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="notificationPreference"
                  value="none"
                  checked={formData.notificationPreference === 'none'}
                  onChange={(e) => setFormData({...formData, notificationPreference: e.target.value})}
                  className="w-4 h-4"
                />
                <span>None</span>
              </label>
            </div>
            {errors.notificationPreference && <p className="text-red-500 text-xs mt-1">{errors.notificationPreference}</p>}
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded font-semibold border-2"
            style={{ borderColor: '#89A8B1', color: '#516469' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;