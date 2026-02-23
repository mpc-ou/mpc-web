// Barrel re-export — all admin server actions
// Import from "../actions" still works (resolves to actions/index.ts)

export {
  adminCreateAchievement,
  adminDeleteAchievement,
  adminGetAchievements,
  adminLinkAchievementMember,
  adminUnlinkAchievementMember,
  adminUpdateAchievement
} from "./achievements";
export {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminGetAnnouncements,
  adminUpdateAnnouncement
} from "./announcements";
export {
  adminCreateFaqItem,
  adminCreateExternalLink,
  adminCreateGalleryImage,
  adminDeleteExternalLink,
  adminDeleteFaqItem,
  adminDeleteGalleryImage,
  adminGetExternalLinks,
  adminGetFaqItems,
  adminGetGalleryImages,
  adminGetHomepageSections,
  adminGetSettings,
  adminUpdateExternalLink,
  adminUpdateFaqItem,
  adminUpsertHomepageSection,
  adminUpsertSetting
} from "./content";
export { adminGetDashboardStats } from "./dashboard";
export { adminCreateDepartment, adminDeleteDepartment, adminGetDepartments } from "./departments";
export { adminCreateEvent, adminDeleteEvent, adminGetEvents, adminUpdateEvent } from "./events";
export {
  adminAddClubRole,
  adminAddMember,
  adminDeleteMember,
  adminGetMemberClubRoles,
  adminGetMembers,
  adminRemoveClubRole,
  adminUpdateMember,
  adminUpdateMemberRole
} from "./members";
export { adminCreatePost, adminDeletePost, adminGetPosts, adminUpdatePost, adminUpdatePostStatus } from "./posts";
export {
  adminCreateProject,
  adminDeleteProject,
  adminGetProjects,
  adminLinkProjectMember,
  adminUnlinkProjectMember,
  adminUpdateProject
} from "./projects";
export { adminCreateSponsor, adminDeleteSponsor, adminGetSponsors, adminUpdateSponsor } from "./sponsors";
