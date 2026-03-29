import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import InstitutionEditDialog from './InstitutionEditDialog.vue';
import type { InstitutionData } from './institution.types';
import { DialogStub } from '../../test/stubs';

const existingInstitution: InstitutionData = { id: 1, name: 'First Bank' };
const newInstitution: InstitutionData = {};

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(InstitutionEditDialog, {
    props: {
      visible: true,
      institution: existingInstitution,
      initialEditMode: false,
      ...props,
    },
    global: {
      plugins: [PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('InstitutionEditDialog', () => {
  describe('view mode (existing institution)', () => {
    it('shows the institution name', () => {
      const wrapper = mountDialog();

      expect(wrapper.text()).toContain(existingInstitution.name);
    });

    it('shows "Make Changes" and "Close" buttons', () => {
      const wrapper = mountDialog();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(true);
    });

    it('does not show "Save" or "Cancel" buttons', () => {
      const wrapper = mountDialog();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('switches to edit mode when "Make Changes" is clicked', async () => {
      const wrapper = mountDialog();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
    });

    it('emits update:visible false when "Close" is clicked', async () => {
      const wrapper = mountDialog();

      await wrapper.find('[data-testid="close-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('edit mode (existing institution)', () => {
    it('shows "Save" and "Cancel" buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('does not show "Make Changes" or "Close" buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(false);
    });

    it('emits save with the form data when "Save" is clicked', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(wrapper.emitted('save')?.[0]).toEqual([
        { id: existingInstitution.id, name: existingInstitution.name },
      ]);
    });

    it('returns to view mode when "Cancel" is clicked on an existing institution', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('resets form data when "Cancel" is clicked on an existing institution', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const nameField = wrapper.findComponent(EcTextField);
      await nameField.vm.$emit('update:modelValue', 'Modified Name');
      await nextTick();

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.text()).toContain(existingInstitution.name);
      expect(wrapper.text()).not.toContain('Modified Name');
    });

    it('does not emit update:visible when "Cancel" is clicked on an existing institution', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });
  });

  describe('edit mode (new institution)', () => {
    it('emits update:visible false when "Cancel" is clicked on a new institution', async () => {
      const wrapper = mountDialog({ institution: newInstitution, initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('form reset on re-open', () => {
    it('resets form data when dialog becomes visible again', async () => {
      const wrapper = mountDialog({ initialEditMode: false });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, institution: { id: 2, name: 'Second Bank' } });

      expect(wrapper.text()).toContain('Second Bank');
    });

    it('resets editMode to initialEditMode when dialog becomes visible again', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true, initialEditMode: false });

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });
  });
});
