<template>
  <Dialog
    :visible="visible"
    header="Bank Account Details"
    modal
    :style="{ width: '40rem' }"
    @update:visible="close"
  >
    <div class="form-fields">
      <EcTextField v-model="formData.name" label="Name" :edit-mode="editMode" />

      <EcListField
        :model-value="formData.account_type"
        label="Account Features"
        :edit-mode="editMode"
        :items="accountFeatureTypes"
        @update:model-value="formData.account_type = $event as string | undefined"
      />

      <EcTextField
        v-model="formData.account_type_description"
        label="Account Type Description"
        :edit-mode="editMode"
      />

      <EcListField
        :model-value="formData.account_category"
        label="Account Category"
        :edit-mode="editMode"
        :items="accountCategories"
        @update:model-value="formData.account_category = $event as string | undefined"
      />

      <EcListField
        :model-value="formData.is_cash"
        label="Is Cash Account?"
        :edit-mode="editMode"
        :items="yesNoList"
        @update:model-value="formData.is_cash = $event as boolean | undefined"
      />

      <EcListField
        :model-value="formData.institution_id"
        label="Financial Institution"
        :edit-mode="editMode"
        :items="institutionItems"
        @update:model-value="formData.institution_id = $event as number | undefined"
      />

      <EcTextField v-model="formData.account_no" label="Official Account #" :edit-mode="editMode" />

      <EcMoneyField v-model="formData.opening_balance" label="Opening Balance" :edit-mode="editMode" />

      <EcListField
        :model-value="formData.import_format"
        label="Bank Account Import Format"
        :edit-mode="editMode"
        :items="importFormats"
        @update:model-value="formData.import_format = $event as string | undefined"
      />

      <EcListField
        :model-value="formData.status"
        label="Status"
        :edit-mode="editMode"
        :items="statuses"
        @update:model-value="formData.status = $event as string | undefined"
      />

      <div v-if="isCreditCard" data-testid="credit-card-section">
        <h3 class="section-heading">Credit Card Related</h3>
        <EcTextField
          v-model="formData.statement_day"
          label="Statement Day"
          type="number"
          :edit-mode="editMode"
        />
        <EcTextField
          v-model="formData.payment_due_day"
          label="Payment Due Day"
          type="number"
          :edit-mode="editMode"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="editMode">
          <Button label="Save" data-testid="save-btn" @click="saveChanges" />
          <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="cancel" />
        </template>
        <template v-else>
          <Button label="Make Changes" data-testid="edit-btn" @click="editMode = true" />
          <Button label="Close" severity="secondary" data-testid="close-btn" @click="close" />
        </template>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import type { BankAccountData, BankAccountFormData, InstitutionData } from './bankAccount.types';

const props = defineProps<{
  visible: boolean;
  bankAccount: BankAccountData;
  institutions: InstitutionData[];
  initialEditMode: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [account: BankAccountData];
}>();

const editMode = ref(props.initialEditMode);

function toBankAccountFormData(account: BankAccountData): BankAccountFormData {
  return {
    id: account.id,
    name: account.name ?? '',
    account_type: account.account_type,
    account_type_description: account.account_type_description ?? '',
    account_category: account.account_category,
    is_cash: account.is_cash,
    institution_id: account.institution_id,
    account_no: account.account_no ?? '',
    opening_balance: account.opening_balance ?? 0,
    import_format: account.import_format,
    status: account.status,
    statement_day: account.statement_day != null ? String(account.statement_day) : '',
    payment_due_day: account.payment_due_day != null ? String(account.payment_due_day) : '',
  };
}

const formData = reactive<BankAccountFormData>(toBankAccountFormData(props.bankAccount));

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      Object.assign(formData, toBankAccountFormData(props.bankAccount));
      editMode.value = props.initialEditMode;
    }
  },
);

const isCreditCard = computed(() => formData.account_type === 'credit_card');

const institutionItems = computed<ListItem[]>(() =>
  props.institutions
    .filter((i): i is { id: number; name: string } => i.id != null && i.name != null)
    .map((i) => ({ id: i.id, name: i.name })),
);

const accountFeatureTypes: ListItem[] = [
  { id: 'normal', name: 'Normal Features' },
  { id: 'sink_fund', name: 'Sink Fund Features' },
  { id: 'credit_card', name: 'Credit Card Features' },
];

const accountCategories: ListItem[] = [
  { id: 'asset', name: 'Asset' },
  { id: 'liability', name: 'Liability' },
  { id: 'current', name: 'Current' },
];

const yesNoList: ListItem[] = [
  { id: true, name: 'Yes' },
  { id: false, name: 'No' },
];

const importFormats: ListItem[] = [
  { id: 'abn-amro-bank', name: 'ABN Amro Bank Account' },
  { id: 'abn-amro-bank-old', name: 'ABN Amro Bank Account (old format)' },
  { id: 'abn-amro-creditcard', name: 'ABN Amro Credit Card (old)' },
  { id: 'abn-amro-creditcard-2026', name: 'ABN Amro Credit Card (2026+)' },
  { id: 'new-bank-account', name: 'Scotia Bank Account' },
  { id: 'fc-bank', name: 'FCB Bank Account' },
  { id: 'fc-creditcard', name: 'FCB Credit Card (not implemented)' },
  { id: 'republic-bank', name: 'Republic Bank Account' },
  { id: 'republic-creditcard', name: 'Republic Credit Card (not implemented)' },
];

const statuses: ListItem[] = [
  { id: 'open', name: 'Open' },
  { id: 'closed', name: 'Closed' },
];

function toBankAccountData(form: BankAccountFormData): BankAccountData {
  return {
    id: form.id,
    name: form.name,
    account_type: form.account_type,
    account_type_description: form.account_type_description,
    account_category: form.account_category,
    is_cash: form.is_cash,
    institution_id: form.institution_id,
    account_no: form.account_no,
    opening_balance: form.opening_balance,
    import_format: form.import_format,
    status: form.status,
    statement_day: form.statement_day !== '' ? parseInt(form.statement_day, 10) : undefined,
    payment_due_day: form.payment_due_day !== '' ? parseInt(form.payment_due_day, 10) : undefined,
  };
}

function saveChanges() {
  emit('save', toBankAccountData(formData));
}

function cancel() {
  if (formData.id) {
    Object.assign(formData, toBankAccountFormData(props.bankAccount));
    editMode.value = false;
  } else {
    emit('update:visible', false);
  }
}

function close() {
  emit('update:visible', false);
}
</script>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.section-heading {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0 0;
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
