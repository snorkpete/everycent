import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AddBudgetDialog from './AddBudgetDialog.vue';
import { DialogStub } from '../../test/stubs';

// Selectors
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';

function createWrapper(props: Partial<{ visible: boolean }> = {}): VueWrapper {
  return mount(AddBudgetDialog, {
    props: {
      visible: true,
      ...props,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('AddBudgetDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the date picker', () => {
      const wrapper = createWrapper();
      expect(wrapper.findComponent({ name: 'DatePicker' }).exists()).toBe(true);
    });

    it('renders the Save button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
    });

    it('renders the Cancel button', () => {
      const wrapper = createWrapper();
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });
  });

  describe('Save button disabled state', () => {
    it('is disabled when no date is selected', () => {
      const wrapper = createWrapper();
      const saveBtn = wrapper.find(SAVE_BTN);
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('Cancel button', () => {
    it('emits update:visible with false when Cancel is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('Save button', () => {
    it('emits save with formatted date string when a date is selected and Save is clicked', async () => {
      const wrapper = createWrapper();

      // Set the internal startDate ref via the DatePicker component
      const datePicker = wrapper.findComponent({ name: 'DatePicker' });
      const testDate = new Date(2025, 2, 1); // March 1, 2025
      datePicker.vm.$emit('update:modelValue', testDate);
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe('2025-03-01');
    });

    it('emits update:visible with false after save', async () => {
      const wrapper = createWrapper();

      const datePicker = wrapper.findComponent({ name: 'DatePicker' });
      const testDate = new Date(2025, 2, 1);
      datePicker.vm.$emit('update:modelValue', testDate);
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('update:visible');
      expect(emitted).toBeDefined();
      expect(emitted![0][0]).toBe(false);
    });
  });

  describe('resetting date on open', () => {
    it('resets the date when the dialog is re-opened', async () => {
      const wrapper = createWrapper({ visible: false });

      // Set a date
      const datePicker = wrapper.findComponent({ name: 'DatePicker' });
      const testDate = new Date(2025, 2, 1);
      datePicker.vm.$emit('update:modelValue', testDate);
      await nextTick();

      // Re-open the dialog
      await wrapper.setProps({ visible: true });
      await nextTick();

      // Save button should be disabled (date was reset to empty string)
      const saveBtn = wrapper.find(SAVE_BTN);
      expect(saveBtn.attributes('disabled')).toBeDefined();
    });
  });
});
