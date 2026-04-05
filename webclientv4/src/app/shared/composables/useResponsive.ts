import { useBreakpoints } from '@vueuse/core';

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

export function useResponsive() {
  const breakpoints = useBreakpoints(BREAKPOINTS);

  return {
    isMobile: breakpoints.smaller('mobile'),
    isCompact: breakpoints.smaller('compact'),
  };
}
