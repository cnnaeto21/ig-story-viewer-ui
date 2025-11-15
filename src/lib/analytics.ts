// src/lib/analytics.ts
import { track } from '@vercel/analytics';

export const analytics = {
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      track(eventName, properties);
    }
  },
};