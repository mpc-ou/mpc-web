/** Post statuses matching Prisma enum. */
export const POST_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  REJECTED: "REJECTED"
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

/** Event-specific statuses. */
export const EVENT_STATUS = {
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

/** Web roles. */
export const WEB_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  COLLABORATOR: "COLLABORATOR"
} as const;

export type WebRole = (typeof WEB_ROLE)[keyof typeof WEB_ROLE];

/** Club position labels. */
export const CLUB_POSITION = {
  PRESIDENT: "PRESIDENT",
  VICE_PRESIDENT: "VICE_PRESIDENT",
  DEPARTMENT_LEADER: "DEPARTMENT_LEADER",
  DEPARTMENT_VICE_LEADER: "DEPARTMENT_VICE_LEADER",
  DEPARTMENT_MEMBER: "DEPARTMENT_MEMBER",
  COLLABORATOR: "COLLABORATOR",
  ADVISOR: "ADVISOR"
} as const;

export type ClubPosition = (typeof CLUB_POSITION)[keyof typeof CLUB_POSITION];
