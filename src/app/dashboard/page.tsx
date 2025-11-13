// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import type { User, WatchlistEntry, Notification } from '../../types/api';

export default function DashboardPage() {
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check if user has token (is logged in)
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all dashboard data
      const [profileData, watchlistData, notificationsData] = await Promise.all([
        api.getProfile(),
        api.getWatchlist(),
        api.getUnreadNotifications(),
      ]);

      setUser(profileData.user);
      setWatchlist(watchlistData.watchlist);
      setNotifications(notificationsData.notifications);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // If unauthorized, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, clear token and redirect
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Story Watcher</h1>
            <p className="text-sm text-gray-600">@{user?.igUsername}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Watchlist & Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Watchlist Section */}
            <WatchlistSection 
              watchlist={watchlist} 
              onUpdate={loadDashboardData}
            />

            {/* Search Section */}
            <SearchSection />
          </div>

          {/* Right Column - Notifications */}
          <div className="lg:col-span-1">
            <NotificationsSection 
              notifications={notifications}
              onUpdate={loadDashboardData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================
// WATCHLIST SECTION COMPONENT
// ============================================

interface WatchlistSectionProps {
  watchlist: WatchlistEntry[];
  onUpdate: () => void;
}

function WatchlistSection({ watchlist, onUpdate }: WatchlistSectionProps) {
  const [newUsername, setNewUsername] = useState('');
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);

    try {
      await api.addToWatchlist(newUsername);
      setNewUsername('');
      onUpdate(); // Refresh watchlist
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFromWatchlist = async (username: string) => {
    try {
      await api.removeFromWatchlist(username);
      onUpdate(); // Refresh watchlist
    } catch (err) {
      console.error('Failed to remove user:', err);
    }
  };

  const handleCheckWatchlist = async () => {
    setChecking(true);
    setCheckResult(null);
    setError('');

    try {
      const result = await api.pollStories();
      setCheckResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check stories');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        ⭐ Watchlist
      </h2>

      {/* Add to Watchlist Form */}
      <form onSubmit={handleAddToWatchlist} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Instagram username"
            className="flex-1 px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={adding || !newUsername}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {/* Watchlist Items */}
      <div className="space-y-2 mb-4">
        {watchlist.length === 0 ? (
          <p className="text-gray-500 text-sm">No users in watchlist yet</p>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="font-medium text-gray-900">
                @{item.target_username}
              </span>
              <button
                onClick={() => handleRemoveFromWatchlist(item.target_username)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Check Watchlist Button */}
      <button
        onClick={handleCheckWatchlist}
        disabled={checking || watchlist.length === 0}
        className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checking ? '🔄 Checking...' : '🔄 Check Watchlist Now'}
      </button>

      {/* Check Results */}
      {checkResult && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="font-semibold text-blue-900 mb-2">Results:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Stories: {checkResult.summary?.totalStories || 0}</li>
            <li>• Watchlist views: {checkResult.summary?.totalWatchlistViews || 0}</li>
            {checkResult.watchlistUsersWhoViewed?.length > 0 && (
              <li>
                • Viewers: {checkResult.watchlistUsersWhoViewed.join(', ')}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEARCH SECTION COMPONENT (REAL-TIME)
// ============================================

function SearchSection() {
    const [stories, setStories] = useState<any[]>([]);
    const [selectedStory, setSelectedStory] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [allViewers, setAllViewers] = useState<any[]>([]);
    const [filteredViewers, setFilteredViewers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const [error, setError] = useState('');
    
    // Labels state
    const [storyLabels, setStoryLabels] = useState<Record<string, string>>({});
    const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');
  
    // Load stories
    const loadStories = async () => {
      setLoading(true);
      setError('');
  
      try {
        const [storiesResult, labelsResult] = await Promise.all([
          api.getMyStories(),
          api.getStoryLabels(),
        ]);
  
        setStories(storiesResult.stories);
        setStoryLabels(labelsResult.labels);
        
        if (storiesResult.stories.length > 0) {
          setSelectedStory(storiesResult.stories[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    };
  
    // Load viewers when story is selected
    const loadViewers = async (storyId: string) => {
      if (!storyId) return;
  
      setLoadingViewers(true);
      setError('');
      setSearchQuery(''); // Reset search when changing stories
  
      try {
        // Fetch all viewers (no search filter)
        const result = await api.searchStoryViewers(storyId);
        setAllViewers(result.viewers);
        setFilteredViewers(result.viewers.slice(0, 5)); // Show first 5
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load viewers');
        setAllViewers([]);
        setFilteredViewers([]);
      } finally {
        setLoadingViewers(false);
      }
    };
  
    // Auto-load viewers when selected story changes
    useEffect(() => {
      if (selectedStory) {
        loadViewers(selectedStory);
      }
    }, [selectedStory]);
  
    // Real-time filtering as user types
    useEffect(() => {
      if (!searchQuery.trim()) {
        // No search query - show first 5
        setFilteredViewers(allViewers.slice(0, 5));
        return;
      }
  
      // Debounce: wait 300ms after user stops typing
      const timer = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const filtered = allViewers.filter(viewer => {
          const usernameMatch = viewer.username.toLowerCase().includes(query);
          const fullNameMatch = viewer.fullName.toLowerCase().includes(query);
          return usernameMatch || fullNameMatch;
        });
        setFilteredViewers(filtered);
      }, 300);
  
      return () => clearTimeout(timer);
    }, [searchQuery, allViewers]);
  
    // Label management functions
    const handleEditLabel = (storyId: string, currentLabel: string | null) => {
      setEditingStoryId(storyId);
      setEditLabel(currentLabel || '');
    };
  
    const handleSaveLabel = async (storyId: string) => {
      try {
        await api.updateStoryLabel(storyId, editLabel);
        setStoryLabels(prev => ({
          ...prev,
          [storyId]: editLabel
        }));
        setEditingStoryId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update label');
      }
    };
  
    const handleCancelEdit = () => {
      setEditingStoryId(null);
      setEditLabel('');
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔍 Search Viewers
        </h2>
  
        {/* Load Stories Button */}
        {stories.length === 0 && (
          <button
            onClick={loadStories}
            disabled={loading}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load My Stories'}
          </button>
        )}
  
        {/* Story Selection & Search */}
        {stories.length > 0 && (
          <div className="space-y-4">
            {/* Story List with Edit Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Stories
              </label>
              <div className="space-y-2">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedStory === story.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedStory(story.id)}
                  >
                    {editingStoryId === story.id ? (
                      // Edit Mode
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Story label (e.g., 'Beach Day')"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveLabel(story.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {storyLabels[story.id] || 'Untitled Story'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(story.takenAt).toLocaleString()} • {story.viewerCount} viewers
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLabel(story.id, storyLabels[story.id]);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
  
            {/* Search Input (Real-time) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Viewers
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people who may have viewed your story..."
                disabled={loadingViewers}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                {searchQuery ? `Showing ${filteredViewers.length} results` : `Showing first 5 of ${allViewers.length} viewers`}
              </p>
            </div>
  
            {/* Loading State */}
            {loadingViewers && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading viewers...</p>
              </div>
            )}
  
            {/* Viewers List */}
            {!loadingViewers && filteredViewers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Viewers {searchQuery && `(filtered)`}
                </p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredViewers.map((viewer: any) => (
                    <div
                      key={viewer.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium text-gray-900">@{viewer.username}</p>
                        <p className="text-sm text-gray-600">{viewer.fullName}</p>
                      </div>
                      {viewer.inWatchlist && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          ⭐ In Watchlist
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* No Results */}
            {!loadingViewers && searchQuery && filteredViewers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No viewers found matching "{searchQuery}"</p>
              </div>
            )}
  
            {/* No Viewers */}
            {!loadingViewers && !searchQuery && allViewers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No one has viewed this story yet</p>
              </div>
            )}
          </div>
        )}
  
        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
// ============================================
// NOTIFICATIONS SECTION COMPONENT
// ============================================

interface NotificationsSectionProps {
  notifications: Notification[];
  onUpdate: () => void;
}

function NotificationsSection({ notifications, onUpdate }: NotificationsSectionProps) {
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      onUpdate();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      onUpdate();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🔔 Notifications
        </h2>
        {notifications.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No new notifications</p>
      ) : (
        <>
          <button
            onClick={handleMarkAllAsRead}
            className="w-full mb-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            Mark all as read
          </button>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <p className="font-medium text-gray-900 text-sm">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}