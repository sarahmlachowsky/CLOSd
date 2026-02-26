// ============================================
// NOTIFICATION SERVICE — CLOSd
// ============================================
// All notification functions are STUBBED for now.
// They log to the console so you can verify the flow works.
// When GHL is connected, swap the console.logs in sendViaGHL()
// for real API calls — everything else stays the same.
// ============================================

// ---- SEND VIA GHL (the only function that touches the API) ----
const sendViaGHL = async (type, recipient, payload) => {
  // STUBBED — replace this with real GHL API call later
  console.log(`[GHL STUB] Sending ${type} to ${recipient}`);
  console.log('[GHL STUB] Payload:', payload);
  return { success: true, stub: true };
};

// ---- NEW DEAL NOTIFICATIONS (Email only) ----
// Groups all assigned tasks by team member, sends one email per person
export const sendNewDealNotifications = async (deal, tasks, teamMembers) => {
  console.log('=== NEW DEAL NOTIFICATION ===');
  console.log(`Deal: ${deal.propertyAddress || deal.clientName} (${deal.type})`);

  // Group tasks by assignee
  const tasksByAssignee = {};
  tasks.forEach(task => {
    if (!task.assignedTo) return;
    if (!tasksByAssignee[task.assignedTo]) {
      tasksByAssignee[task.assignedTo] = [];
    }
    tasksByAssignee[task.assignedTo].push(task);
  });

  // Send one email per assignee
  for (const [assigneeName, assignedTasks] of Object.entries(tasksByAssignee)) {
    const member = teamMembers.find(
      m => `${m.firstName} ${m.lastName}`.trim().toLowerCase() === assigneeName.trim().toLowerCase()
    );

    if (!member) {
      console.log(`[SKIP] No member found for "${assigneeName}"`);
      continue;
    }

    const taskList = assignedTasks.map(t =>
      `  - ${t.name} (${t.theme})${t.dueDate ? ` — Due: ${t.dueDate}` : ''}`
    ).join('\n');

    const emailPayload = {
      to: member.email,
      subject: `New Deal Created — ${deal.propertyAddress || deal.clientName}`,
      body: `Hi ${member.firstName},\n\nA new ${deal.type} deal has been created in CLOSd:\n\nDeal: ${deal.propertyAddress || deal.clientName}\nClient: ${deal.clientName}\nType: ${deal.type}\n\nHere are the tasks assigned to you:\n\n${taskList}\n\nTotal tasks assigned to you: ${assignedTasks.length}\n\nLog in to CLOSd to get started.\n\n— The CLOSd Team`,
    };

    // New deal = ALWAYS email only (too long for SMS)
    await sendViaGHL('email', member.email, emailPayload);
    console.log(`[NEW DEAL] Email queued for ${member.firstName} ${member.lastName} (${assignedTasks.length} tasks)`);
  }

  console.log('=== END NEW DEAL NOTIFICATION ===');
};

// ---- TASK ASSIGNED NOTIFICATION (Email + SMS based on preference) ----
export const sendTaskAssignedNotification = async (deal, task, teamMembers) => {
  console.log('=== TASK ASSIGNED NOTIFICATION ===');

  if (!task.assignedTo) return;

  const member = teamMembers.find(
    m => `${m.firstName} ${m.lastName}`.trim().toLowerCase() === task.assignedTo.trim().toLowerCase()
  );

  if (!member) {
    console.log(`[SKIP] No member found for "${task.assignedTo}"`);
    return;
  }

  const pref = member.notificationPreference || 'email';
  const dealName = deal.propertyAddress || deal.clientName || 'Untitled Deal';

  const emailPayload = {
    to: member.email,
    subject: `New Task Assigned — ${task.name}`,
    body: `Hi ${member.firstName},\n\nYou've been assigned a new task in CLOSd:\n\nTask: ${task.name}\nDeal: ${dealName}\nTheme: ${task.theme}${task.dueDate ? `\nDue: ${task.dueDate}` : ''}\n\nLog in to CLOSd to view details.\n\n— The CLOSd Team`,
  };

  const smsPayload = {
    to: member.phone,
    body: `CLOSd: You've been assigned "${task.name}" for ${dealName}.${task.dueDate ? ` Due: ${task.dueDate}.` : ''}`,
  };

  if (pref === 'email' || pref === 'both') {
    await sendViaGHL('email', member.email, emailPayload);
    console.log(`[TASK ASSIGNED] Email queued for ${member.firstName}`);
  }

  if ((pref === 'sms' || pref === 'both') && member.phone) {
    await sendViaGHL('sms', member.phone, smsPayload);
    console.log(`[TASK ASSIGNED] SMS queued for ${member.firstName}`);
  }

  if (pref === 'none') {
    console.log(`[TASK ASSIGNED] ${member.firstName} has notifications disabled — skipped`);
  }

  console.log('=== END TASK ASSIGNED NOTIFICATION ===');
};

// ---- DUE SOON REMINDER (Email + SMS based on preference) ----
export const sendDueSoonReminder = async (deal, task, teamMembers) => {
  console.log('=== DUE SOON REMINDER ===');

  if (!task.assignedTo) return;

  const member = teamMembers.find(
    m => `${m.firstName} ${m.lastName}`.trim().toLowerCase() === task.assignedTo.trim().toLowerCase()
  );

  if (!member) return;

  const pref = member.notificationPreference || 'email';
  const dealName = deal.propertyAddress || deal.clientName || 'Untitled Deal';

  const emailPayload = {
    to: member.email,
    subject: `Task Due Tomorrow — ${task.name}`,
    body: `Hi ${member.firstName},\n\nReminder: "${task.name}" for ${dealName} is due tomorrow (${task.dueDate}).\n\nLog in to CLOSd to complete it.\n\n— The CLOSd Team`,
  };

  const smsPayload = {
    to: member.phone,
    body: `CLOSd Reminder: "${task.name}" for ${dealName} is due tomorrow.`,
  };

  if (pref === 'email' || pref === 'both') {
    await sendViaGHL('email', member.email, emailPayload);
  }

  if ((pref === 'sms' || pref === 'both') && member.phone) {
    await sendViaGHL('sms', member.phone, smsPayload);
  }

  console.log(`[DUE SOON] Reminder sent for "${task.name}" → ${member.firstName}`);
  console.log('=== END DUE SOON REMINDER ===');
};

// ---- OVERDUE ALERT (Email + SMS based on preference) ----
export const sendOverdueAlert = async (deal, task, teamMembers) => {
  console.log('=== OVERDUE ALERT ===');

  if (!task.assignedTo) return;

  const member = teamMembers.find(
    m => `${m.firstName} ${m.lastName}`.trim().toLowerCase() === task.assignedTo.trim().toLowerCase()
  );

  if (!member) return;

  const pref = member.notificationPreference || 'email';
  const dealName = deal.propertyAddress || deal.clientName || 'Untitled Deal';

  const emailPayload = {
    to: member.email,
    subject: `OVERDUE — ${task.name}`,
    body: `Hi ${member.firstName},\n\nHeads up: "${task.name}" for ${dealName} was due on ${task.dueDate} and hasn't been completed yet.\n\nPlease log in and update it ASAP.\n\n— The CLOSd Team`,
  };

  const smsPayload = {
    to: member.phone,
    body: `CLOSd: OVERDUE — "${task.name}" for ${dealName} was due ${task.dueDate}. Please complete ASAP.`,
  };

  if (pref === 'email' || pref === 'both') {
    await sendViaGHL('email', member.email, emailPayload);
  }

  if ((pref === 'sms' || pref === 'both') && member.phone) {
    await sendViaGHL('sms', member.phone, smsPayload);
  }

  console.log(`[OVERDUE] Alert sent for "${task.name}" → ${member.firstName}`);
  console.log('=== END OVERDUE ALERT ===');
};