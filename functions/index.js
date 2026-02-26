const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.dailyTaskReminders = onSchedule(
  {
    schedule: "every day 08:00",
    timeZone: "America/Toronto",
  },
  async () => {
    console.log("Running daily task reminder check...");

    // Get all organizations
    const orgsSnap = await db.collection("organizations").get();

    for (const orgDoc of orgsSnap.docs) {
      const orgId = orgDoc.id;
      const orgName = orgDoc.data().name || "Unknown Org";

      // Get all active projects for this org
      const projectsSnap = await db
        .collection("organizations")
        .doc(orgId)
        .collection("projects")
        .where("status", "==", "active")
        .get();

      // Get team members for notification preferences
      const membersSnap = await db
        .collection("organizations")
        .doc(orgId)
        .collection("members")
        .get();

      const members = membersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      for (const projectDoc of projectsSnap.docs) {
        const project = { id: projectDoc.id, ...projectDoc.data() };
        const dealTitle =
          project.type === "Buyer"
            ? project.clientName || "Buyer Deal"
            : project.propertyAddress || "Seller Deal";

        // Get all tasks for this project
        const tasksSnap = await db
          .collection("organizations")
          .doc(orgId)
          .collection("projects")
          .doc(project.id)
          .collection("tasks")
          .get();

        for (const taskDoc of tasksSnap.docs) {
          const task = { id: taskDoc.id, ...taskDoc.data() };

          // Skip completed, N/A, or unassigned tasks
          if (!task.dueDate) continue;
          if (task.status === "complete" || task.status === "not-applicable") continue;
          if (!task.assignedTo) continue;

          const now = new Date();
          const dueDate = new Date(task.dueDate);
          const diffMs = dueDate - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          // Find the assigned team member
          const member = members.find(
            (m) =>
              `${m.firstName || ""} ${m.lastName || ""}`.trim().toLowerCase() ===
                task.assignedTo.toLowerCase().trim() ||
              (m.name && m.name.toLowerCase().trim() === task.assignedTo.toLowerCase().trim())
          );

          const preference = member?.notificationPreference || "email";
          if (preference === "none") continue;

          if (diffDays < 0) {
            // OVERDUE
            console.log(
              `[OVERDUE] Org: ${orgName} | Deal: ${dealTitle} | Task: ${task.name} | Assigned: ${task.assignedTo} | Due: ${task.dueDate} | Pref: ${preference}`
            );
            // TODO: Replace with real GHL API call
            // sendViaGHL({ type: 'overdue', member, task, dealTitle, preference });
          } else if (diffDays <= 1) {
            // DUE SOON (tomorrow or today)
            console.log(
              `[DUE SOON] Org: ${orgName} | Deal: ${dealTitle} | Task: ${task.name} | Assigned: ${task.assignedTo} | Due: ${task.dueDate} | Pref: ${preference}`
            );
            // TODO: Replace with real GHL API call
            // sendViaGHL({ type: 'dueSoon', member, task, dealTitle, preference });
          }
        }
      }
    }

    console.log("Daily task reminder check complete.");
  }
);