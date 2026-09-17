'use client';

import { useSyncExternalStore } from 'react';

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverFalse = () => false;

/** Mount browser-dependent state only after the server snapshot has hydrated. */
export function useClientReady() {
  return useSyncExternalStore(subscribeReady, clientReady, serverFalse);
}

function subscribeMotion(listener: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
const motionSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, motionSnapshot, serverFalse);
}

function subscribeVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}
const hiddenSnapshot = () => document.hidden;

export function usePageHidden() {
  return useSyncExternalStore(subscribeVisibility, hiddenSnapshot, serverFalse);
}
