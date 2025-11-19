// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { analytics } from '../../lib/analytics';

export default function LoginPage() {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      await api.login({
        igUsername: username,
        igPassword: password,
        email: email,
      });

      toast.success('Login successful! Redirecting...');
      // Login successful - redirect to dashboard
      analytics.track('login_success');
      router.push('/dashboard');
    } catch (err) {
      // Store error in state
      const errorObj = err instanceof Error ? err : new Error('Login failed');
      setError(errorObj);

      // Login failed - show error toast
      if (err instanceof Error && err.message.includes('email to help you')) {
        toast.error(
          'Instagram requires verification. Please:\n' +
          '1. Login to Instagram app/website manually\n' +
          '2. Complete email verification\n' +
          '3. Try again in 24 hours'
        );
      } else {
        toast.error(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Story Watcher
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 font-bold">Tired of scrolling through hundreds of people just to see if your crush has viewed your story?</p>
        <p className="mt-2 text-sm text-gray-600">
          Sign in with your Instagram account and we'll let you search through who has viewed your story easily!
        </p>
      </div>
      {error && error.message.includes('email to help you') && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Verification Required
              </h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p>Instagram needs to verify this account. Please:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Login to Instagram manually on their app/website</li>
                  <li>Complete the email verification</li>
                  <li>Wait 24 hours, then try again here</li>
                </ol>
                <p className="mt-2 text-xs italic">
                  This is a one-time security check. Your account will work normally afterwards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        {/* Inputs */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Instagram Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="your_username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Instagram Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="••••••••"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Security Notice */}
        <p className="text-xs text-center text-gray-500">
          🔒 Your credentials are encrypted and never stored
        </p>
      </form>
    </div>
  </main>
  );
}