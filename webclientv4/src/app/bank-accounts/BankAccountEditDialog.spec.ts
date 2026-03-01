import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcListField from '../shared/form/list-field/EcListField.vue';
import BankAccountEditDialog from './BankAccountEditDialog.vue';
import type { BankAccountData, InstitutionData } from './bankAccount.types';

// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['visible'],
  emits: ['update:visible'],
};

const institutions: InstitutionData[] = [
  { id: 1, name: 'First Bank' },
  { id: 2, name: 'Second Bank' },
];

const existingAccount: BankAccountData = {
  id: 42,
  name: 'My Savings',
  account_type: 'normal',
  account_type_description: 'Regular savings',
  account_category: 'asset',
  is_cash: false,
  institution_id: 1,
  account_no: '1234567',
  opening_balance: 10000,
  import_format: 'abn-amro-bank',
  status: 'open',
  statement_day: undefined,
  payment_due_day: undefined,
};

const creditCardAccount: BankAccountData = {
  id: 99,
  name: 'Visa Card',
  account_type: 'credit_card',
  statement_day: 15,
  payment_due_day: 28,
};

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(BankAccountEditDialog, {
    props: {
      visible: true,
      bankAccount: existingAccount,
      initialEditMode: false,
      institutions,
      ...props,
    },
    global: {
      plugins: [PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('BankAccountEditDialog', () => {
  describe('view mode (initialEditMode = false)', () => {
    it('displays the account name', () => {
      const wrapper = mountDialog();

      expect(wrapper.text()).toContain(existingAccount.name);
    });

    it('shows Make Changes and Close buttons', () => {
      const wrapper = mountDialog();
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).toContain('Make Changes');
      expect(labels).toContain('Close');
    });

    it('does not show Save or Cancel buttons', () => {
      const wrapper = mountDialog();
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).not.toContain('Save');
      expect(labels).not.toContain('Cancel');
    });
  });

  describe('edit mode (initialEditMode = true)', () => {
    it('shows Save and Cancel buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });

    it('does not show Make Changes or Close buttons', () => {
      const wrapper = mountDialog({ initialEditMode: true });
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).not.toContain('Make Changes');
      expect(labels).not.toContain('Close');
    });
  });

  describe('Make Changes button', () => {
    it('switches to edit mode', async () => {
      const wrapper = mountDialog();

      const makeChangesBtn = wrapper.findAll('button').find((b) => b.text() === 'Make Changes')!;
      await makeChangesBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });
  });

  describe('Cancel button', () => {
    it('reverts to view mode for an existing account', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Make Changes');
    });

    it('closes the dialog for a new account (no id)', async () => {
      const wrapper = mountDialog({ bankAccount: { name: '' }, initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('Close button', () => {
    it('emits update:visible false', async () => {
      const wrapper = mountDialog();

      const closeBtn = wrapper.findAll('button').find((b) => b.text() === 'Close')!;
      await closeBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('Save button', () => {
    it('emits save with the current form data', async () => {
      const wrapper = mountDialog({ initialEditMode: true });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toMatchObject({ id: existingAccount.id, name: existingAccount.name });
    });
  });

  describe('form reset on re-open', () => {
    it('resets form data when dialog becomes visible again', async () => {
      // Use view mode so the name renders as visible text (not inside an input)
      const wrapper = mountDialog({ initialEditMode: false });

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({
        visible: true,
        bankAccount: { id: 99, name: 'Other Account' },
      });

      expect(wrapper.text()).toContain('Other Account');
    });
  });

  describe('credit card section', () => {
    it('does not show credit card fields for a normal account', () => {
      const wrapper = mountDialog();

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(false);
    });

    it('shows credit card fields when account_type is credit_card', () => {
      const wrapper = mountDialog({ bankAccount: creditCardAccount });

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(true);
    });

    it('shows credit card fields after switching account_type to credit_card', async () => {
      const wrapper = mountDialog({ initialEditMode: true });
      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(false);

      // The first EcListField is the "Account Features" (account_type) field
      const accountTypeField = wrapper.findAllComponents(EcListField)[0];
      await accountTypeField.vm.$emit('update:modelValue', 'credit_card');
      await nextTick();

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(true);
    });
  });
});
