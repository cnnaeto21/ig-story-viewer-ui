// src/types/api.ts

/**
 * This file defines all the data structures we get from our API.
 * Think of these as contracts - the API promises to send data in this shape.
 */

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
    igUsername: string;
    igPassword: string;
    email: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
      id: string;
      igUsername: string;
      igUserId: string;
    };
  }
  
  // ============================================
  // USER TYPES
  // ============================================
  
  export interface User {
    id: string;
    igUsername: string;
    igUserId: string;
    email?: string;
    createdAt: string;
  }
  
  // ============================================
  // WATCHLIST TYPES
  // ============================================
  
  export interface WatchlistEntry {
    id: string;
    target_username: string;
    target_user_id?: string;
    added_at: string;
    last_checked_at?: string;
  }
  
  export interface WatchlistResponse {
    count: number;
    watchlist: WatchlistEntry[];
  }
  
  // ============================================
  // STORY TYPES
  // ============================================
  
  export interface Story {
    id: string;
    url: string;
    mediaType: number;
    takenAt: string;
    expiringAt: string;
    viewerCount: number;
  }
  
  export interface StoryViewer {
    username: string;
    userId: string;
    fullName: string;
    profilePicUrl: string;
    isVerified: boolean;
    inWatchlist?: boolean;
  }
  
  export interface StorySearchResponse {
    storyId: string;
    totalViewers: number;
    matchedViewers: number;
    searchQuery: string | null;
    viewers: StoryViewer[];
  }
  
  export interface StoriesResponse {
    count: number;
    stories: Story[];
  }
  
  // ============================================
  // NOTIFICATION TYPES
  // ============================================
  
  export interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    viewer_username?: string;
    story_id?: string;
    viewed_at?: string;
  }
  
  export interface NotificationsResponse {
    count: number;
    notifications: Notification[];
  }
  
  // ============================================
  // ERROR TYPES
  // ============================================
  
  export interface ApiError {
    error: string;
    message?: string;
  }