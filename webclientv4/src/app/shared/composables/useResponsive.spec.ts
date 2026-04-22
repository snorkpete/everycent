import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectScope } from 'vue';
import { useResponsive } from './useResponsive';

type ChangeHandler = (event: MediaQueryListEvent) => void;

interface FakeMediaQueryList {
  matches: boolean;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  simulate: (matches: boolean) => void;
}

function makeFakeMediaQueryList(initialMatches: boolean): FakeMediaQueryList {
  const handlers: ChangeHandler[] = [];

  const mql: FakeMediaQueryList = {
    matches: initialMatches,
    addEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
      handlers.push(handler);
    }),
    removeEventListener: vi.fn((_event: string, handler: ChangeHandler) => {
      const index = handlers.indexOf(handler);
      if (index !== -1) handlers.splice(index, 1);
    }),
    simulate(newMatches: boolean) {
      mql.matches = newMatches;
      const event = { matches: newMatches } as MediaQueryListEvent;
      handlers.forEach((h) => h(event));
    },
  };

  return mql;
}

describe('useResponsive', () => {
  let mobileMql: FakeMediaQueryList;
  let compactMql: FakeMediaQueryList;

  beforeEach(() => {
    mobileMql = makeFakeMediaQueryList(false);
    compactMql = makeFakeMediaQueryList(false);

    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(max-width: 575px)') return mobileMql as unknown as MediaQueryList;
      if (query === '(max-width: 991px)') return compactMql as unknown as MediaQueryList;
      return makeFakeMediaQueryList(false) as unknown as MediaQueryList;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns isMobile as false on desktop', () => {
    const { isMobile } = useResponsive();

    expect(isMobile.value).toBe(false);
  });

  it('returns isCompact as false on desktop', () => {
    const { isCompact } = useResponsive();

    expect(isCompact.value).toBe(false);
  });

  it('returns isMobile as true when viewport is below mobile breakpoint', () => {
    mobileMql = makeFakeMediaQueryList(true);
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(max-width: 575px)') return mobileMql as unknown as MediaQueryList;
      if (query === '(max-width: 991px)') return compactMql as unknown as MediaQueryList;
      return makeFakeMediaQueryList(false) as unknown as MediaQueryList;
    });

    const { isMobile } = useResponsive();

    expect(isMobile.value).toBe(true);
  });

  it('returns isCompact as true when viewport is below compact breakpoint', () => {
    compactMql = makeFakeMediaQueryList(true);
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(max-width: 575px)') return mobileMql as unknown as MediaQueryList;
      if (query === '(max-width: 991px)') return compactMql as unknown as MediaQueryList;
      return makeFakeMediaQueryList(false) as unknown as MediaQueryList;
    });

    const { isCompact } = useResponsive();

    expect(isCompact.value).toBe(true);
  });

  it('is reactive to viewport changes', () => {
    const { isMobile, isCompact } = useResponsive();

    expect(isMobile.value).toBe(false);
    expect(isCompact.value).toBe(false);

    mobileMql.simulate(true);
    compactMql.simulate(true);

    expect(isMobile.value).toBe(true);
    expect(isCompact.value).toBe(true);
  });

  it('queries matchMedia with correct max-width values for breakpoints', () => {
    useResponsive();

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 575px)');
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 991px)');
  });

  it('removes event listeners when the scope is disposed', () => {
    const scope = effectScope();
    scope.run(() => useResponsive());

    scope.stop();

    expect(mobileMql.removeEventListener).toHaveBeenCalled();
    expect(compactMql.removeEventListener).toHaveBeenCalled();
  });
});
