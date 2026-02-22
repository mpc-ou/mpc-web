// Barrel re-export — all admin server actions
// Import from "../actions" still works (resolves to actions/index.ts)

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
export {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminGetAnnouncements,
  adminUpdateAnnouncement
} from "./announcements";
export { adminCreateEvent, adminDeleteEvent, adminGetEvents, adminUpdateEvent } from "./events";
export { adminCreatePost, adminDeletePost, adminGetPosts, adminUpdatePost, adminUpdatePostStatus } from "./posts";
export {
  adminCreateFaqItem,
  adminCreateGalleryImage,
  adminDeleteFaqItem,
  adminDeleteGalleryImage,
  adminGetFaqItems,
  adminGetGalleryImages,
  adminGetHomepageSections,
  adminGetSettings,
  adminUpdateFaqItem,
  adminUpsertHomepageSection,
  adminUpsertSetting
} from "./content";
export { adminCreateSponsor, adminDeleteSponsor, adminGetSponsors, adminUpdateSponsor } from "./sponsors";
export { adminCreateDepartment, adminDeleteDepartment, adminGetDepartments } from "./departments";
export { adminGetDashboardStats } from "./dashboard";
export {
  adminCreateAchievement,
  adminDeleteAchievement,
  adminGetAchievements,
  adminLinkAchievementMember,
  adminUnlinkAchievementMember,
  adminUpdateAchievement
} from "./achievements";
export {
  adminCreateProject,
  adminDeleteProject,
  adminGetProjects,
  adminLinkProjectMember,
  adminUnlinkProjectMember,
  adminUpdateProject
} from "./projects";
