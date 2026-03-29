/**
 * Shared test stubs for PrimeVue components that are awkward to render
 * in unit tests (e.g. teleport-based dialogs).
 *
 * Usage:
 *   import { DialogStub } from '../../test/stubs';
 *   mount(MyComponent, { global: { stubs: { Dialog: DialogStub } } });
 */

export const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: {
    visible: { type: Boolean },
    header: { type: String },
    modal: { type: Boolean },
    closable: { type: Boolean },
    style: { type: Object },
  },
  emits: ['update:visible'],
};
