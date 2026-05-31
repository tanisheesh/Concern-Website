/**
 * Shared TypeScript types for the CONCERN Admin Social Media Portal.
 * All database table schemas are defined here so every future module
 * imports from a single source of truth.
 *
 * Timestamps are stored as ISO-8601 strings in SQLite and represented
 * as strings here. Use `new Date(value)` to convert when needed.
 */

// ---------------------------------------------------------------------------
// Admin Users
// ---------------------------------------------------------------------------

export type AdminRole = 'super_admin' | 'staff';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;   // ISO-8601
  updatedAt?: string;  // ISO-8601
}

/** Safe version of AdminUser — never includes passwordHash */
export interface AdminUserPublic {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Social Connections
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'youtube';

export interface SocialConnection {
  id: number;
  platform: SocialPlatform;
  /** AES-256-GCM encrypted access token */
  accessToken: string;
  /** AES-256-GCM encrypted refresh token (if applicable) */
  refreshToken?: string;
  tokenExpiresAt?: string;  // ISO-8601
  accountId: string;
  accountName: string;
  /** Facebook Page ID / Instagram Business Account ID */
  pageId?: string;
  connectedAt: string;      // ISO-8601
  connectedBy: number;      // adminUser.id
  isActive: number;         // SQLite boolean: 1 = true, 0 = false
  lastRefreshedAt?: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Media Library
// ---------------------------------------------------------------------------

export type MediaCategory =
  | 'Rehabilitation'
  | 'Community Outreach'
  | 'Awareness Programs'
  | 'Food Distribution'
  | 'Events'
  | 'Fundraising'
  | 'Success Stories'
  | 'Volunteer Activities'
  | 'Other';

export type MediaType = 'image' | 'video' | 'document';

export interface MediaItem {
  id: number;
  fileName: string;
  originalFileName: string;
  /**
   * Storage reference — Google Drive file ID for media uploaded via Drive,
   * or a local path for future local storage.
   */
  driveFileId?: string;
  /** Public HTTPS URL (Drive thumbnail or direct link) */
  publicUrl: string;
  mimeType: string;
  mediaType: MediaType;
  fileSize: number;    // bytes
  width?: number;      // pixels (images only)
  height?: number;     // pixels (images only)
  duration?: number;   // seconds (videos only)
  // Event metadata
  eventName: string;
  description: string;
  eventDate?: string;  // ISO-8601
  location?: string;
  category: MediaCategory;
  beneficiariesCount?: number;
  volunteerCount?: number;
  tags: string;        // JSON array stored as TEXT
  uploadedBy: number;  // adminUser.id
  uploadedAt: string;  // ISO-8601
  updatedAt?: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Knowledge Base
// ---------------------------------------------------------------------------

export type KnowledgeDocType =
  | 'brochure'
  | 'mission_statement'
  | 'annual_report'
  | 'program_description'
  | 'past_content'
  | 'brand_guidelines'
  | 'other';

export interface KnowledgeBaseDoc {
  id: number;
  fileName: string;
  originalFileName: string;
  driveFileId?: string;
  publicUrl: string;
  mimeType: string;
  fileSize: number;
  docType: KnowledgeDocType;
  /** Full extracted text for AI context injection */
  extractedText?: string;
  description?: string;
  uploadedBy: number;  // adminUser.id
  uploadedAt: string;  // ISO-8601
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'partially_published'
  | 'failed';

export interface PlatformContent {
  caption?: string;
  content?: string;
  hashtags?: string[];
  message?: string;
}

export interface GeneratedContent {
  instagram?: PlatformContent;
  facebook?: PlatformContent;
  linkedin?: PlatformContent;
  twitter?: PlatformContent;
  whatsapp?: PlatformContent;
}

export interface PlatformPublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  publishedAt?: string; // ISO-8601
}

export interface Post {
  id: number;
  title: string;
  eventDescription: string;
  mediaIds: string;           // JSON array stored as TEXT
  posterDriveFileId?: string;
  posterPublicUrl?: string;
  generatedContent?: string;  // JSON stored as TEXT
  platforms: string;          // JSON array stored as TEXT
  status: PostStatus;
  scheduledAt?: string;       // ISO-8601
  publishedAt?: string;       // ISO-8601
  publishResults?: string;    // JSON stored as TEXT
  createdBy: number;          // adminUser.id
  createdAt: string;          // ISO-8601
  updatedAt?: string;         // ISO-8601
}

// ---------------------------------------------------------------------------
// Analytics Snapshots
// ---------------------------------------------------------------------------

export interface AnalyticsSnapshot {
  id: number;
  platform: SocialPlatform;
  postId: number;
  platformPostId: string;
  reach?: number;
  impressions?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  fetchedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Impact Metrics
// ---------------------------------------------------------------------------

export interface ImpactMetrics {
  id: number;
  /** Calendar month this record covers: YYYY-MM */
  period: string;
  eventsCount: number;
  postsPublished: number;
  totalReach: number;
  volunteersParticipated: number;
  campaignsConducted: number;
  fundraisingActivities: number;
  beneficiariesReached: number;
  recordedAt: string;  // ISO-8601
  recordedBy: number;  // adminUser.id
}

// ---------------------------------------------------------------------------
// NextAuth session augmentation
// ---------------------------------------------------------------------------

/** Extend next-auth's built-in User type */
export interface AdminSessionUser {
  id: string;   // kept as string for NextAuth compatibility
  name: string;
  email: string;
  role: AdminRole;
}
