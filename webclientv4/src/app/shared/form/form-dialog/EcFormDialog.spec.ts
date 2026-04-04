import { describe, it, expect } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcFormDialog from './EcFormDialog.vue';
import { DialogStub } from '../../../../test/stubs';

function createWrapper(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
): VueWrapper {
  return mount(EcFormDialog, {
    props: {
      visible: true,
      header: 'Test Dialog',
      ...props,
    },
    slots: {
      default: '<div data-testid="slot-content">Form content</div>',
      ...slots,
    },
    global: {
      plugins: [PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('EcFormDialog', () => {
  describe('view mode (default)', () => {
    it('shows "Make Changes" and "Close" buttons by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(true);
    });

    it('does not show "Save" or "Cancel" buttons in view mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('emits update:visible false when "Close" is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="close-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });

    it('provides editMode=false to the default slot', () => {
      const wrapper = createWrapper(
        {},
        {
          default:
            '<template #default="{ editMode }"><span data-testid="edit-mode-value">{{ editMode }}</span></template>',
        },
      );

      expect(wrapper.find('[data-testid="edit-mode-value"]').text()).toBe('false');
    });

    it('uses custom close label when provided', () => {
      const wrapper = createWrapper({ closeLabel: 'Dismiss' });

      expect(wrapper.find('[data-testid="close-btn"]').text()).toBe('Dismiss');
    });

    it('uses custom edit label when provided', () => {
      const wrapper = createWrapper({ editLabel: 'Edit' });

      expect(wrapper.find('[data-testid="edit-btn"]').text()).toBe('Edit');
    });
  });

  describe('edit mode', () => {
    it('shows "Save" and "Cancel" when initialEditMode is true', () => {
      const wrapper = createWrapper({ initialEditMode: true });

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('does not show "Make Changes" or "Close" in edit mode', () => {
      const wrapper = createWrapper({ initialEditMode: true });

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(false);
    });

    it('emits save when "Save" is clicked', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(wrapper.emitted('save')).toBeTruthy();
    });

    it('emits cancel when "Cancel" is clicked', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('reverts to view mode when "Cancel" is clicked', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(true);
    });

    it('does not close the dialog when "Cancel" is clicked in view/edit mode', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });

    it('provides editMode=true to the default slot', () => {
      const wrapper = createWrapper(
        { initialEditMode: true },
        {
          default:
            '<template #default="{ editMode }"><span data-testid="edit-mode-value">{{ editMode }}</span></template>',
        },
      );

      expect(wrapper.find('[data-testid="edit-mode-value"]').text()).toBe('true');
    });

    it('uses custom save label when provided', () => {
      const wrapper = createWrapper({ initialEditMode: true, saveLabel: 'Add' });

      expect(wrapper.find('[data-testid="save-btn"]').text()).toBe('Add');
    });
  });

  describe('always-edit mode', () => {
    it('always shows "Save" and "Cancel" buttons', () => {
      const wrapper = createWrapper({ alwaysEdit: true });

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('does not show "Make Changes" or "Close" buttons', () => {
      const wrapper = createWrapper({ alwaysEdit: true });

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(false);
    });

    it('emits cancel then closes when "Cancel" is clicked', async () => {
      const wrapper = createWrapper({ alwaysEdit: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });

    it('emits save when "Save" is clicked', async () => {
      const wrapper = createWrapper({ alwaysEdit: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(wrapper.emitted('save')).toBeTruthy();
    });

    it('disables save button when saveDisabled is true', () => {
      const wrapper = createWrapper({ alwaysEdit: true, saveDisabled: true });

      expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeDefined();
    });
  });

  describe('dialog chrome', () => {
    it('passes header to the Dialog component', () => {
      const wrapper = createWrapper({ header: 'My Header' });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('header')).toBe('My Header');
    });

    it('uses default width of 30rem with max-width constraint', () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('style')).toEqual({ width: '30rem', maxWidth: '95vw' });
    });

    it('merges dialogStyle with width and allows overriding maxWidth', () => {
      const wrapper = createWrapper({ width: '72rem', dialogStyle: { maxWidth: '80vw' } });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('style')).toEqual({ width: '72rem', maxWidth: '80vw' });
    });
  });

  describe('footer-extra slot', () => {
    it('renders footer-extra slot content', () => {
      const wrapper = createWrapper(
        {},
        {
          'footer-extra': '<button data-testid="extra-btn">Extra</button>',
        },
      );

      expect(wrapper.find('[data-testid="extra-btn"]').exists()).toBe(true);
    });

    it('provides editMode to footer-extra slot', () => {
      const wrapper = createWrapper(
        { initialEditMode: true },
        {
          'footer-extra':
            '<template #footer-extra="{ editMode }"><span data-testid="footer-edit-mode">{{ editMode }}</span></template>',
        },
      );

      expect(wrapper.find('[data-testid="footer-edit-mode"]').text()).toBe('true');
    });
  });

  describe('reset on reopen', () => {
    it('resets editMode to initialEditMode when dialog reopens', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      // Switch to view mode via cancel
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);

      // Close and reopen
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, initialEditMode: true });

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
    });

    it('resets editMode to false when dialog reopens with initialEditMode false', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, initialEditMode: false });

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });
  });
});
