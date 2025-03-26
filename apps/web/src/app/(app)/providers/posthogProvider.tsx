'use client';

import { posthog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const lastPart = parts.pop();
    if (lastPart !== undefined) {
      return lastPart.split(';').shift();
    }
  }
};

if (typeof window !== 'undefined') {
  const flags = getCookie('bootstrapData');

  let bootstrapData = {};
  if (flags) {
    const decodedFlags = decodeURIComponent(flags);
    bootstrapData = JSON.parse(decodedFlags);
  }
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '',
    bootstrap: bootstrapData,
    // person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    // capture_pageview: false,
    // capture_pageleave: true, // Enable pageleave capture
  });
}

const PHProvider = ({ children }: { children: React.ReactNode }) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};

export default PHProvider;
