import { config } from '@vue/test-utils';
import Tooltip from 'primevue/tooltip';

config.global.directives = {
  ...config.global.directives,
  tooltip: Tooltip,
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
