/** Supabase storage bucket name. */
export const STORAGE_BUCKET = "media" as const;

/** Storage folder paths within the media bucket. */
export const STORAGE_PATHS = {
  avatars: "avatars",
  covers: "covers",
  achievements: "achievements",
  events: "events",
  eventBanners: "events/banners",
  blogs: "blogs",
  blogThumbnails: "blogs/thumbnails",
  projects: "projects",
  gallery: "gallery",
  sponsors: "sponsors",
  activities: "activities"
} as const;
