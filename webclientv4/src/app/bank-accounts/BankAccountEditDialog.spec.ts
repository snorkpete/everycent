import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import BankAccountEditDialog from './BankAccountEditDialog.vue';
import type { BankAccountData } from './bankAccount.types';
import type { InstitutionData } from '../institutions/institution.types';
import { DialogStub } from '../../test/stubs';

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

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(BankAccountEditDialog, {
    props: {
      visible: true,
      bankAccount: existingAccount,
      initialEditMode: false,
      institutions,
      bankAccounts: [],
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
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(existingAccount.name);
    });

    it('shows Make Changes and Close buttons', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).toContain('Make Changes');
      expect(labels).toContain('Close');
    });

    it('does not show Save or Cancel buttons', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).not.toContain('Save');
      expect(labels).not.toContain('Cancel');
    });
  });

  describe('edit mode (initialEditMode = true)', () => {
    it('shows Save and Cancel buttons', () => {
      const wrapper = createWrapper({ initialEditMode: true });
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });

    it('does not show Make Changes or Close buttons', () => {
      const wrapper = createWrapper({ initialEditMode: true });
      const buttons = wrapper.findAll('button');
      const labels = buttons.map((b) => b.text());

      expect(labels).not.toContain('Make Changes');
      expect(labels).not.toContain('Close');
    });
  });

  describe('Make Changes button', () => {
    it('switches to edit mode', async () => {
      const wrapper = createWrapper();

      const makeChangesBtn = wrapper.findAll('button').find((b) => b.text() === 'Make Changes')!;
      await makeChangesBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Save');
      expect(labels).toContain('Cancel');
    });
  });

  describe('Cancel button', () => {
    it('reverts to view mode for an existing account', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      const labels = wrapper.findAll('button').map((b) => b.text());
      expect(labels).toContain('Make Changes');
    });

    it('resets form data to original values for an existing account', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      const nameField = wrapper.findAllComponents(EcTextField)[0];
      await nameField.vm.$emit('update:modelValue', 'Modified Name');
      await nextTick();

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');
      await nextTick();

      // In view mode now — name renders as text
      expect(wrapper.text()).toContain(existingAccount.name);
      expect(wrapper.text()).not.toContain('Modified Name');
    });

    it('closes the dialog for a new account (no id)', async () => {
      const wrapper = createWrapper({ bankAccount: { name: '' }, initialEditMode: true });

      const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')!;
      await cancelBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('Close button', () => {
    it('emits update:visible false', async () => {
      const wrapper = createWrapper();

      const closeBtn = wrapper.findAll('button').find((b) => b.text() === 'Close')!;
      await closeBtn.trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('Save button', () => {
    it('emits save with the current form data', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toMatchObject({ id: existingAccount.id, name: existingAccount.name });
    });

    it('converts statement_day and payment_due_day from strings to numbers for a credit card account', async () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount, initialEditMode: true });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted![0][0]).toMatchObject({
        statement_day: creditCardAccount.statement_day,
        payment_due_day: creditCardAccount.payment_due_day,
      });
    });
  });

  describe('form reset on re-open', () => {
    it('resets form data when dialog becomes visible again', async () => {
      // Use view mode so the name renders as visible text (not inside an input)
      const wrapper = createWrapper({ initialEditMode: false });

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
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(false);
    });

    it('shows credit card fields when account_type is credit_card', () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount });

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(true);
    });

    it('shows credit card fields after switching account_type to credit_card', async () => {
      const wrapper = createWrapper({ initialEditMode: true });
      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(false);

      // The first EcListField is the "Account Features" (account_type) field
      const accountTypeField = wrapper.findAllComponents(EcListField)[0];
      await accountTypeField.vm.$emit('update:modelValue', 'credit_card');
      await nextTick();

      expect(wrapper.find('[data-testid="credit-card-section"]').exists()).toBe(true);
    });
  });

  describe('asset link field', () => {
    const loanAccount: BankAccountData = {
      id: 50,
      name: 'Car Loan',
      account_type: 'normal',
      account_category: 'liability',
      is_cash: false,
      status: 'open',
      asset_bank_account_id: null,
    };

    const houseAsset: BankAccountData = {
      id: 10,
      name: 'House',
      account_category: 'asset',
      is_cash: false,
      status: 'open',
    };

    const carAsset: BankAccountData = {
      id: 11,
      name: 'Car',
      account_category: 'asset',
      is_cash: false,
      status: 'open',
    };

    const closedAsset: BankAccountData = {
      id: 12,
      name: 'Old Apartment',
      account_category: 'asset',
      is_cash: false,
      status: 'closed',
    };

    const cashAsset: BankAccountData = {
      id: 13,
      name: 'Savings',
      account_category: 'asset',
      is_cash: true,
      status: 'open',
    };

    it('does not show the asset link field for an asset account', () => {
      const wrapper = createWrapper({ bankAccount: existingAccount });
      expect(wrapper.find('[data-testid="asset-link-field"]').exists()).toBe(false);
    });

    it('does not show the asset link field for a credit card', () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount });
      expect(wrapper.find('[data-testid="asset-link-field"]').exists()).toBe(false);
    });

    it('shows the asset link field for a non-credit-card liability', () => {
      const wrapper = createWrapper({ bankAccount: loanAccount });
      expect(wrapper.find('[data-testid="asset-link-field"]').exists()).toBe(true);
    });

    it('lists only open, non-cash asset accounts, sorted alphabetically by name', () => {
      const wrapper = createWrapper({
        bankAccount: loanAccount,
        bankAccounts: [houseAsset, carAsset, closedAsset, cashAsset, loanAccount],
      });

      const field = wrapper.find('[data-testid="asset-link-field"]').findComponent(EcListField);
      const items = field.props('items') as { id: number; name: string }[];
      expect(items.map((i) => i.name)).toEqual(['Car', 'House']);
    });

    it('binds the current saved asset_bank_account_id to the field', () => {
      const linkedLoan: BankAccountData = { ...loanAccount, asset_bank_account_id: 10 };
      const wrapper = createWrapper({
        bankAccount: linkedLoan,
        bankAccounts: [houseAsset, carAsset],
      });

      const field = wrapper.find('[data-testid="asset-link-field"]').findComponent(EcListField);
      expect(field.props('modelValue')).toBe(10);
    });

    it('save emits asset_bank_account_id as null for non-liability accounts', async () => {
      const wrapper = createWrapper({
        bankAccount: { ...existingAccount, asset_bank_account_id: 10 },
        initialEditMode: true,
      });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted![0][0]).toMatchObject({ asset_bank_account_id: null });
    });

    it('save emits asset_bank_account_id as null for credit card accounts', async () => {
      const wrapper = createWrapper({
        bankAccount: {
          ...creditCardAccount,
          account_category: 'liability',
          asset_bank_account_id: 10,
        },
        initialEditMode: true,
      });

      const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'Save')!;
      await saveBtn.trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted![0][0]).toMatchObject({ asset_bank_account_id: null });
    });
  });
});
