// src/contexts/loadingStore.js
// Module-level loading counter. client.js calls start/stop around every
// request; GlobalLoader subscribes and renders the overlay. No React context
// needed because client.js is not a component.

let count = 0;
let visible = false;
let showTimer = null;
let hideTimer = null;
const listeners = new Set();

// Don't flash the overlay on fast requests — only show when a call has been
// in flight for this long.
const SHOW_DELAY = 300;
// Once shown, stay visible at least this long after the last request settles,
// so a page that fires several sequential calls (or a cold-starting backend)
// doesn't flicker the overlay between them.
const MIN_DISPLAY = 800;

function setVisible(v) {
  if (visible !== v) {
    visible = v;
    listeners.forEach((fn) => fn(v));
  }
}

export function startLoading() {
  count += 1;
  if (count === 1) {
    clearTimeout(hideTimer);
    showTimer = setTimeout(() => setVisible(true), SHOW_DELAY);
  }
}

export function stopLoading() {
  count = Math.max(0, count - 1);
  if (count === 0) {
    clearTimeout(showTimer);
    if (visible) {
      // Hold the overlay briefly so sequential requests on one page render
      // as a single continuous load instead of show/hide/show.
      hideTimer = setTimeout(() => setVisible(false), MIN_DISPLAY);
    } else {
      setVisible(false);
    }
  }
}

export function subscribeLoading(fn) {
  listeners.add(fn);
  fn(visible);
  return () => listeners.delete(fn);
}