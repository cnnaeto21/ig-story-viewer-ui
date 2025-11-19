'use client';

import { useState } from 'react';

interface AvatarProps {
  username: string;
  src?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function Avatar({ username, src, size = 'medium', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
  };

  // Get first letter of username
  const initial = username.charAt(0).toUpperCase();

  // Generate consistent color based on username
  const getColorFromUsername = (name: string) => {
    const colors = [
      'bg-purple-500',
      'bg-pink-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getColorFromUsername(username);

  // Show fallback if no src or image failed to load
  const showFallback = !src || imageError;
  const proxiedSrc = src 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/proxy/image?url=${encodeURIComponent(src)}`
    : null;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${showFallback ? bgColor : 'bg-gray-200'}
        rounded-full
        flex items-center justify-center
        text-white font-semibold
        flex-shrink-0
        overflow-hidden
        relative
        ${className}
      `}
      title={username}
    >
      {showFallback ? (
        // Fallback: Show initial
        initial
      ) : (
        <>
          {/* Loading state */}
          {imageLoading && (
            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
              {initial}
            </div>
          )}
          
          {/* Actual image */}
          <img
            src={proxiedSrc || ''}
            alt={username}
            className={`
              w-full h-full object-cover
              ${imageLoading ? 'opacity-0' : 'opacity-100'}
              transition-opacity duration-200
            `}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </>
      )}
    </div>
  );
}