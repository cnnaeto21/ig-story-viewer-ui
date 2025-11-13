// src/lib/api.ts
import type {
    LoginRequest,
    LoginResponse,
    User,
    WatchlistResponse,
    WatchlistEntry,
    StoriesResponse,
    StorySearchResponse,
    NotificationsResponse,
  } from '../types/api';
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  class ApiClient {
    private baseUrl: string;
  
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }
  
    private getToken(): string | null {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('token');
    }
  
    private setToken(token: string): void {
      if (typeof window === 'undefined') return;
      localStorage.setItem('token', token);
    }
  
    private clearToken(): void {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('token');
    }
  
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
      ): Promise<T> {
        const token = this.getToken();
        
        // Create headers as a plain object
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
      
        // Merge existing headers from options
        if (options.headers) {
          const existingHeaders = new Headers(options.headers);
          existingHeaders.forEach((value, key) => {
            headers[key] = value;
          });
        }
      
        // Add auth header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      
        const config: RequestInit = {
          ...options,
          headers,
        };
      
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, config);
          
          // Handle 204 No Content
          if (response.status === 204) {
            return {} as T;
          }
      
          const data = await response.json();
      
          // Check if request was successful
          if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
          }
      
          return data as T;
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Network error');
        }
      }
  
    // AUTH METHODS
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      const response = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      this.setToken(response.token);
      return response;
    }
  
    async logout(): Promise<void> {
      await this.request('/api/auth/logout', { method: 'POST' });
      this.clearToken();
    }
  
    // USER METHODS
    async getProfile(): Promise<{ user: User }> {
      return this.request<{ user: User }>('/api/user/profile');
    }
  
    async updateProfile(email: string): Promise<{ user: User }> {
      return this.request<{ user: User }>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ email }),
      });
    }
  
    // WATCHLIST METHODS
    async getWatchlist(): Promise<WatchlistResponse> {
      return this.request<WatchlistResponse>('/api/watchlist');
    }
  
    async addToWatchlist(targetUsername: string): Promise<WatchlistEntry> {
      return this.request<WatchlistEntry>('/api/watchlist', {
        method: 'POST',
        body: JSON.stringify({ targetUsername }),
      });
    }
  
    async removeFromWatchlist(username: string): Promise<void> {
      return this.request(`/api/watchlist/${username}`, { method: 'DELETE' });
    }
  
    // STORY METHODS
    async getMyStories(): Promise<StoriesResponse> {
      return this.request<StoriesResponse>('/api/stories/mine');
    }
  
    async searchStoryViewers(
      storyId: string,
      searchQuery?: string
    ): Promise<StorySearchResponse> {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      return this.request<StorySearchResponse>(`/api/stories/${storyId}/viewers${query}`);
    }
  
    async pollStories(): Promise<any> {
      return this.request('/api/stories/poll', { method: 'POST' });
    }
  
    // NOTIFICATION METHODS
    async getNotifications(): Promise<NotificationsResponse> {
      return this.request<NotificationsResponse>('/api/notifications');
    }
  
    async getUnreadNotifications(): Promise<NotificationsResponse> {
      return this.request<NotificationsResponse>('/api/notifications/unread');
    }
  
    async markNotificationAsRead(notificationId: string): Promise<void> {
      return this.request(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
    }
  
    async markAllNotificationsAsRead(): Promise<void> {
      return this.request('/api/notifications/read-all', { method: 'PUT' });
    }
    // STORY METHODS section - add these two methods:

    async updateStoryLabel(storyId: string, label: string): Promise<void> {
        return this.request(`/api/stories/${storyId}/label`, {
        method: 'PUT',
        body: JSON.stringify({ label }),
        });
    }
  
    async getStoryLabels(): Promise<{ labels: Record<string, string> }> {
        return this.request('/api/stories/labels');
    }
  }
  
  export const api = new ApiClient(API_URL);