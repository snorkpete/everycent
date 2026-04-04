import { useBreakpoints } from '@vueuse/core';

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
