import { ref, onScopeDispose } from 'vue';
import type { Ref } from 'vue';

/**
 * Single source of truth for responsive breakpoints.
 *
 * Exposes reactive booleans:
 * - `isMobile`: viewport < 576px (PrimeFlex `sm` — phone)
 * - `isCompact`: viewport < 992px (PrimeFlex `lg` — phone + tablet)
 *
 * Why JS-driven (not CSS `@media`): CSS custom properties can't be used in
 * `@media` conditions (spec limitation), and we rejected adding an SCSS
 * preprocessor. Keep all responsive logic here — no `@media` queries in
 * component CSS, no hardcoded breakpoint values.
 */
const BREAKPOINTS = {
  mobile: 576,
  compact: 992,
} as const;

function makeMediaQuery(maxWidthPx: number): Ref<boolean> {
  const query = window.matchMedia(`(max-width: ${maxWidthPx - 1}px)`);
  const matches = ref(query.matches);

  const handler = (event: MediaQueryListEvent) => {
    matches.value = event.matches;
  };

  query.addEventListener('change', handler);

  onScopeDispose(() => {
    query.removeEventListener('change', handler);
  });

  return matches;
}

export function useResponsive() {
  return {
    isMobile: makeMediaQuery(BREAKPOINTS.mobile),
    isCompact: makeMediaQuery(BREAKPOINTS.compact),
  };
}
