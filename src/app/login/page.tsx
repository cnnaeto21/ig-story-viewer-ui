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
  const [error, setError] = useState('');

  // State for verification flow
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationType, setVerificationType] = useState<string>('');
  const [verificationIdentifier, setVerificationIdentifier] = useState<string>('');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login({
        igUsername: username,
        igPassword: password,
        email: email,
      });

      // Check if verification is required
      if ('requiresVerification' in result && result.requiresVerification) {
        setVerificationRequired(true);
        setVerificationType(result.verificationType);
        setVerificationIdentifier(result.identifier);
        setVerificationMessage(result.message);
        toast.info(result.message);
        analytics.track('verification_required', {
          type: result.verificationType
        });
      } else {
        // Normal login success
        toast.success('Login successful! Redirecting...');
        analytics.track('login_success');
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      analytics.track('Login Failed', {
        error: err instanceof Error ? err.message : 'Login failed'
      });
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.verifyLogin({
        identifier: verificationIdentifier,
        verificationCode: verificationCode,
        verificationType: verificationType,
      });

      toast.success('Verification successful! Redirecting...');
      analytics.track('verification_success', {
        type: verificationType
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      analytics.track('verification_failed', {
        type: verificationType,
        error: err instanceof Error ? err.message : 'Verification failed'
      });
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setVerificationRequired(false);
    setVerificationCode('');
    setError('');
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!verificationRequired ? (
        // Login Form
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {/* Email Input */}
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

          {/* Username Input */}
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

          {/* Password Input */}
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
      ) : (
        // Verification Form
        <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {/* Verification Message */}
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">{verificationMessage}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            {/* Verification Code Input */}
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={verificationType === 'two_factor' ? 6 : 8}
              />
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          </form>

          {/* Security Notice */}
          <p className="text-xs text-center text-gray-500">
            🔒 Your verification code is sent securely
          </p>
        </div>
      )}
    </div>
  </main>
  );
}
