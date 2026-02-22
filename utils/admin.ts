/**
 * Parse ADMIN_ACCOUNT env var (format: "[email1,email2]")
 * Returns array of root admin emails
 */
export function getRootAdminEmails(): string[] {
  const raw = process.env.ADMIN_ACCOUNT ?? "";
  return raw
    .replace(/[[\]"]/g, "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function isRootAdmin(email: string): boolean {
  return getRootAdminEmails().includes(email);
}
