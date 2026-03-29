import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import AllocationCategoryEditDialog from './AllocationCategoryEditDialog.vue';
import type { AllocationCategoryData } from './allocationCategory.types';

// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['visible'],
  emits: ['update:visible'],
};

const existingCategory: AllocationCategoryData = { id: 1, name: 'Groceries' };
const newCategory: AllocationCategoryData = {};

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(AllocationCategoryEditDialog, {
    props: {
      visible: true,
      allocationCategory: existingCategory,
      initialEditMode: false,
      ...props,
    },
    global: {
      plugins: [PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('AllocationCategoryEditDialog', () => {
  describe('view mode (existing category)', () => {
    it('shows the category name', () => {
      const wrapper = mountDialog();

      expect(wrapper.text()).toContain(existingCategory.name);
    });

    it('shows "Make Changes" and "Close" buttons', () => {
      const wrapper = mountDialog();
      const labels = wrapper.findAll('button').map((b) => b.text());

      expect(labels).toContain('Make Changes');
      expect(labels).toContain('Close');
    });

    it('does not show "Save" or "Cancel" buttons', () => {
      const wrapper = mountDialog();
      const labels = wrapper.findAll('button').map((b) => b.text());

      expect(labels).not.toContain('Save');
      expect(labels).not.toContain('Cancel');
    });

    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = mountDialog();

      const makeChangesBtn = wrapper.findAll('button').find((b) => b.text() === 'Make Changes')!;
      await makeChangesBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });

    it('emits update:visible false when "Close" is clicked', async () => {
      const wrapper = mountDialog();

      const closeBtn = wrapper.findAll('button').find((b) => b.text() === 'Close')!;
      await closeBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('edit mode (existing category)', () => {
    it('shows "Save" and "Cancel" buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });
      const labels = wrapper.findAll('button').map((b) => b.text());

      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });

    it('does not show "Make Changes" or "Close" buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });
      const labels = wrapper.findAll('button').map((b) => b.text());

      expect(labels).not.toContain('Make Changes');
      expect(labels).not.toContain('Close');
    });

    it('emits save with the form data when "Save" is clicked', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      expect(wrapper.emitted('save')?.[0]).toEqual([
        { id: existingCategory.id, name: existingCategory.name },
      ]);
    });

    it('returns to view mode when "Cancel" is clicked on an existing category', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Make Changes');
    });

    it('resets form data when "Cancel" is clicked on an existing category', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const nameField = wrapper.findComponent(EcTextField);
      await nameField.vm.$emit('update:modelValue', 'Modified Name');
      await nextTick();

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain(existingCategory.name);
      expect(wrapper.text()).not.toContain('Modified Name');
    });

    it('does not emit update:visible when "Cancel" is clicked on an existing category', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });
  });

  describe('edit mode (new category)', () => {
    it('emits update:visible false when "Cancel" is clicked on a new category', async () => {
      const wrapper = mountDialog({ allocationCategory: newCategory, initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('form reset on re-open', () => {
    it('resets form data when dialog becomes visible again', async () => {
      const wrapper = mountDialog({ initialEditMode: false });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, allocationCategory: { id: 2, name: 'Utilities' } });

      expect(wrapper.text()).toContain('Utilities');
    });

    it('resets editMode to initialEditMode when dialog becomes visible again', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, initialEditMode: false });

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Make Changes');
    });
  });
});
