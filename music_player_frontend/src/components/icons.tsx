import { component$ } from "@builder.io/qwik";

/**
 * Simple icon components (text-based for no external deps)
 */

// PUBLIC_INTERFACE
export const IconPlay = component$(() => {
  /** Minimal play icon as text to avoid deps */
  return <span aria-hidden="true">►</span>;
});

// PUBLIC_INTERFACE
export const IconPause = component$(() => {
  /** Minimal pause icon as text to avoid deps */
  return <span aria-hidden="true">❚❚</span>;
});

// PUBLIC_INTERFACE
export const IconNext = component$(() => {
  /** Minimal next icon as text to avoid deps */
  return <span aria-hidden="true">►►</span>;
});

// PUBLIC_INTERFACE
export const IconPrev = component$(() => {
  /** Minimal previous icon as text to avoid deps */
  return <span aria-hidden="true">◄◄</span>;
});
