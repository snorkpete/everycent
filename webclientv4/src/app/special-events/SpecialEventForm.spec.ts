import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SpecialEventForm from './SpecialEventForm.vue';
import type { SpecialEventData } from './specialEvent.types';

const DialogStub = {
  name: 'Dialog',
  template: '<div data-testid="form-dialog"><slot /><slot name="footer" /></div>',
  props: ['visible', 'header', 'modal', 'style'],
  emits: ['update:visible'],
};

function createWrapper(
  overrides: {
    visible?: boolean;
    specialEvent?: SpecialEventData | null;
  } = {},
): VueWrapper {
  return mount(SpecialEventForm, {
    props: {
      visible: overrides.visible ?? true,
      specialEvent: overrides.specialEvent ?? null,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('SpecialEventForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('dialog title', () => {
    it('shows "Add Special Event" when no specialEvent is provided', () => {
      const wrapper = createWrapper({ specialEvent: null });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('header')).toBe('Add Special Event');
    });

    it('shows "Edit Special Event" when a specialEvent with id is provided', () => {
      const wrapper = createWrapper({
        specialEvent: { id: 1, name: 'Birthday', budget_amount: 50000 },
      });

      const dialog = wrapper.findComponent({ name: 'Dialog' });
      expect(dialog.props('header')).toBe('Edit Special Event');
    });
  });

  describe('submit button label', () => {
    it('shows "Add" when creating a new event', () => {
      const wrapper = createWrapper({ specialEvent: null });

      const submitBtn = wrapper.find('[data-testid="submit-btn"]');
      expect(submitBtn.text()).toBe('Add');
    });

    it('shows "Save" when editing an existing event', () => {
      const wrapper = createWrapper({
        specialEvent: { id: 1, name: 'Birthday', budget_amount: 50000 },
      });

      const submitBtn = wrapper.find('[data-testid="submit-btn"]');
      expect(submitBtn.text()).toBe('Save');
    });
  });

  describe('form submission', () => {
    it('emits submit with form data for a new event', async () => {
      const wrapper = createWrapper({ specialEvent: null });

      // The form fields are rendered inside the dialog stub
      // Simulate filling in data by triggering the internal state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.vm as any;
      vm.formData.name = 'Wedding';
      vm.formData.budget_amount = 100000;
      vm.formData.start_date = '2026-06-15';
      await nextTick();

      await wrapper.find('[data-testid="submit-btn"]').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.emitted('submit')![0][0]).toEqual({
        name: 'Wedding',
        budget_amount: 100000,
        start_date: '2026-06-15',
      });
    });

    it('includes id when editing an existing event', async () => {
      const wrapper = createWrapper({
        specialEvent: { id: 5, name: 'Birthday', budget_amount: 50000 },
      });

      await wrapper.find('[data-testid="submit-btn"]').trigger('click');

      expect(wrapper.emitted('submit')).toBeTruthy();
      expect(wrapper.emitted('submit')![0][0]).toMatchObject({ id: 5 });
    });

    it('omits start_date when it is empty', async () => {
      const wrapper = createWrapper({ specialEvent: null });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.vm as any;
      vm.formData.name = 'Quick Event';
      vm.formData.budget_amount = 5000;
      vm.formData.start_date = '';
      await nextTick();

      await wrapper.find('[data-testid="submit-btn"]').trigger('click');

      const emitted = wrapper.emitted('submit')![0][0] as Partial<SpecialEventData>;
      expect(emitted).not.toHaveProperty('start_date');
    });
  });

  describe('submit button disabled state', () => {
    it('is disabled when name is empty', () => {
      const wrapper = createWrapper({ specialEvent: null });

      const submitBtn = wrapper.find('[data-testid="submit-btn"]');
      expect(submitBtn.attributes('disabled')).toBeDefined();
    });

    it('is enabled when name is provided', async () => {
      const wrapper = createWrapper({
        specialEvent: { id: 1, name: 'Birthday', budget_amount: 50000 },
      });

      const submitBtn = wrapper.find('[data-testid="submit-btn"]');
      expect(submitBtn.attributes('disabled')).toBeUndefined();
    });
  });

  describe('cancel button', () => {
    it('emits update:visible with false', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')![0][0]).toBe(false);
    });
  });

  describe('form reset on open', () => {
    it('resets form data when dialog becomes visible', async () => {
      const wrapper = createWrapper({
        visible: false,
        specialEvent: { id: 1, name: 'Birthday', budget_amount: 50000, start_date: '2026-01-01' },
      });

      // Modify internal state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.vm as any;
      vm.formData.name = 'Changed';
      await nextTick();

      // Simulate opening the dialog
      await wrapper.setProps({ visible: true });
      await nextTick();

      expect(vm.formData.name).toBe('Birthday');
      expect(vm.formData.budget_amount).toBe(50000);
      expect(vm.formData.start_date).toBe('2026-01-01');
    });

    it('resets to empty form when opening for a new event', async () => {
      const wrapper = createWrapper({
        visible: false,
        specialEvent: null,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.vm as any;
      vm.formData.name = 'Leftover';
      await nextTick();

      await wrapper.setProps({ visible: true });
      await nextTick();

      expect(vm.formData.name).toBe('');
      expect(vm.formData.budget_amount).toBe(0);
      expect(vm.formData.start_date).toBe('');
    });
  });
});
