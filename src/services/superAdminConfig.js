// SuperAdmin emails — these users get platformRole: "superAdmin"
// Add new SA emails here as needed
export const SUPER_ADMIN_EMAILS = [
  'sarah.m.lachowsky@gmail.com',
  'lindsey@spillersrealtygroup.com',
];

export const isSuperAdminEmail = (email) => {
  return SUPER_ADMIN_EMAILS.includes(email?.toLowerCase().trim());
};
