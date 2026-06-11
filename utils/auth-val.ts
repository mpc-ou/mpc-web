import { prisma } from "@/configs/prisma/db";

export async function validateEmailAllowed(email: string): Promise<{ allowed: boolean; reason?: string }> {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: ["auth_accepted_domains", "auth_only_existing_members", "auth_require_member_role"]
      }
    }
  });

  const settingsMap = new Map<string, string>();
  for (const s of settings) {
    settingsMap.set(s.key, s.value);
  }

  const acceptedDomainsStr = settingsMap.get("auth_accepted_domains") ?? process.env.AUTH_ACCEPTED_DOMAINS ?? "";
  const onlyExistingMembers = settingsMap.get("auth_only_existing_members") === "true";
  const requireMemberRole = settingsMap.has("auth_require_member_role")
    ? settingsMap.get("auth_require_member_role") === "true"
    : process.env.AUTH_REQUIRE_MEMBER_ROLE === "true";

  const emailLower = email.toLowerCase();

  const domains = acceptedDomainsStr
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  let domainMatch = false;
  for (const domain of domains) {
    if (emailLower.endsWith(`@${domain}`) || emailLower.endsWith(`.${domain}`)) {
      domainMatch = true;
      break;
    }
  }

  if (!domainMatch && domains.length > 0) {
    return {
      allowed: false,
      reason: `Email domain is not allowed. Only domains ending in: ${domains.join(", ")} are accepted.`
    };
  }

  if (onlyExistingMembers || requireMemberRole) {
    const existing = await prisma.member.findFirst({
      where: {
        OR: [{ email: emailLower }, { githubEmail: emailLower }]
      },
      select: { id: true, webRole: true }
    });

    if (!existing) {
      return {
        allowed: false,
        reason: "Access denied. Only registered club members in the database are allowed to log in."
      };
    }

    if (requireMemberRole && existing.webRole === "GUEST") {
      return {
        allowed: false,
        reason:
          "Access denied. Guest accounts are not permitted to log in. Please contact an administrator to upgrade your account."
      };
    }
  }

  return { allowed: true };
}
