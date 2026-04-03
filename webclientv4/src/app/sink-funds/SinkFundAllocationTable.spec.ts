import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SinkFundAllocationTable from './SinkFundAllocationTable.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import type { SinkFundAllocationData, SinkFundData } from './sinkFund.types';
import { getTooltipValue } from '../../test/tooltip-helper';

// Selectors
const ALLOCATIONS_TABLE = '[data-testid="allocations-table"]';
const SUMMARY_ROW_BALANCE = '[data-testid="summary-row-balance"]';
const SUMMARY_ROW_UNASSIGNED = '[data-testid="summary-row-unassigned"]';
const ALLOCATION_ROW = '[data-testid="allocation-row"]';
const TOTAL_ROW = '[data-testid="total-row"]';
const NAME_INPUT = '[data-testid="allocation-name-input"]';
const COMMENT_INPUT = '[data-testid="allocation-comment-input"]';
const DELETE_BTN = '[data-testid="obligation-delete-btn"]';
const UNDO_DELETE_BTN = '[data-testid="obligation-restore-btn"]';
const DEACTIVATE_BTN = '[data-testid="deactivate-btn"]';
const REACTIVATE_BTN = '[data-testid="reactivate-btn"]';
const SHOW_TRANSACTIONS_BTN = '[data-testid="show-transactions-btn"]';

const openAllocation: SinkFundAllocationData = {
  id: 10,
  name: 'Car Insurance',
  current_balance: 25000,
  target: 50000,
  comment: 'Annual premium',
  status: 'open',
  deleted: false,
};

const closedAllocation: SinkFundAllocationData = {
  id: 11,
  name: 'Old Goal',
  current_balance: 10000,
  target: 10000,
  comment: 'Done',
  status: 'closed',
  deleted: false,
};

const zeroTargetAllocation: SinkFundAllocationData = {
  id: 12,
  name: 'No Target',
  current_balance: 5000,
  target: 0,
  comment: '',
  status: 'open',
  deleted: false,
};

const sinkFund: SinkFundData = {
  id: 1,
  name: 'Emergency Fund',
  current_balance: 100000,
  sink_fund_allocations: [openAllocation, zeroTargetAllocation],
};

const mockStore = reactive({
  sinkFund: null as SinkFundData | null,
  visibleAllocations: [] as SinkFundAllocationData[],
  isEditMode: false,
  totalAssignedBalance: 0,
  unassignedBalance: 0,
  totalTarget: 0,
  totalOutstanding: 0,
});

vi.mock('./sinkFundStore', () => ({
  useSinkFundStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(SinkFundAllocationTable, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('SinkFundAllocationTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.sinkFund = { ...sinkFund };
    mockStore.visibleAllocations = [openAllocation, zeroTargetAllocation];
    mockStore.isEditMode = false;
    mockStore.totalAssignedBalance = 30000;
    mockStore.unassignedBalance = 70000;
    mockStore.totalTarget = 50000;
    mockStore.totalOutstanding = -25000;
  });

  describe('table structure', () => {
    it('renders the allocations table', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ALLOCATIONS_TABLE).exists()).toBe(true);
    });

    it('renders table headers with correct column names', () => {
      const wrapper = createWrapper();

      const headers = wrapper.findAll('thead th');
      expect(headers[0].text()).toBe('Name');
      expect(headers[1].text()).toBe('Current Balance');
      expect(headers[2].text()).toBe('Target');
      expect(headers[3].text()).toBe('Outstanding');
      expect(headers[4].text()).toBe('Comment');
      expect(headers[5].text()).toBe('Status');
    });

    it('does not show actions column in view mode', () => {
      const wrapper = createWrapper();

      const headers = wrapper.findAll('thead th');
      expect(headers).toHaveLength(6);
    });

    it('shows actions column in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      const headers = wrapper.findAll('thead th');
      expect(headers).toHaveLength(7);
    });
  });

  describe('summary rows', () => {
    it('renders the sink fund account balance summary row without comment', () => {
      const wrapper = createWrapper();

      const row = wrapper.find(SUMMARY_ROW_BALANCE);
      expect(row.exists()).toBe(true);
      const cells = row.findAll('td');
      expect(cells[0].text()).toBe('Sink Fund Account Balance');
      expect(cells[1].text()).toBe('1,000.00');
      expect(cells[4].text()).toBe('');
    });

    it('renders the unassigned money summary row with tooltip icon', () => {
      const wrapper = createWrapper();

      const row = wrapper.find(SUMMARY_ROW_UNASSIGNED);
      expect(row.exists()).toBe(true);
      const cells = row.findAll('td');
      expect(cells[0].text()).toContain('Unassigned Money');
      expect(cells[1].text()).toBe('700.00');
      expect(cells[4].text()).toBe('');

      const tooltip = row.find('[data-testid="unassigned-tooltip"]');
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.classes()).toContain('pi-info-circle');
    });

    it('applies bold styling to summary rows', () => {
      const wrapper = createWrapper();

      const balanceRow = wrapper.find(SUMMARY_ROW_BALANCE);
      const unassignedRow = wrapper.find(SUMMARY_ROW_UNASSIGNED);
      expect(balanceRow.classes()).toContain('summary-row');
      expect(unassignedRow.classes()).toContain('summary-row');
    });
  });

  describe('allocation rows — view mode', () => {
    it('renders a row for each visible allocation', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows).toHaveLength(2);
    });

    it('displays allocation name as text', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].findAll('td')[0].text()).toContain('Car Insurance');
    });

    it('displays current balance formatted as dollars', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].findAll('td')[1].text()).toContain('250.00');
    });

    it('displays target formatted as dollars', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].findAll('td')[2].text()).toContain('500.00');
    });

    it('computes outstanding as current_balance - target when target > 0', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      // 25000 - 50000 = -25000 = -250.00
      expect(rows[0].findAll('td')[3].text()).toContain('250.00');
    });

    it('shows outstanding as 0.00 when target is 0', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[1].findAll('td')[3].text()).toBe('0.00');
    });

    it('applies negative class when outstanding is negative', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const outstandingDisplay = rows[0].findAll('td')[3].find('.money-display');
      expect(outstandingDisplay.classes()).toContain('negative');
    });

    it('applies positive class when outstanding is positive', async () => {
      mockStore.visibleAllocations = [{ ...openAllocation, current_balance: 60000, target: 50000 }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const outstandingDisplay = rows[0].findAll('td')[3].find('.money-display');
      expect(outstandingDisplay.classes()).toContain('positive');
    });

    it('applies muted class when outstanding is zero', async () => {
      mockStore.visibleAllocations = [{ ...openAllocation, current_balance: 50000, target: 50000 }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const outstandingDisplay = rows[0].findAll('td')[3].find('.money-display');
      expect(outstandingDisplay.classes()).toContain('muted');
    });

    it('displays allocation comment', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].findAll('td')[4].text()).toBe('Annual premium');
    });

    it('displays allocation status', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].findAll('td')[5].text()).toBe('open');
    });

    it('renders eye icon button with correct title', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const eyeBtn = rows[0].find(SHOW_TRANSACTIONS_BTN);
      expect(eyeBtn.exists()).toBe(true);
      expect(getTooltipValue(eyeBtn)).toBe('Show transactions for this allocation');
    });

    it('opens transactions dialog when eye icon is clicked', async () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('visible')).toBe(false);

      const rows = wrapper.findAll(ALLOCATION_ROW);
      await rows[0].find(SHOW_TRANSACTIONS_BTN).trigger('click');
      await nextTick();

      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationId')).toBe(openAllocation.id);
      expect(dialog.props('allocationName')).toBe(openAllocation.name);
    });

    it('applies ec-deleted styling to closed allocations', async () => {
      mockStore.visibleAllocations = [{ ...closedAllocation }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].classes()).toContain('ec-deleted');
    });

    it('does not apply ec-deleted styling to open allocations', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].classes()).not.toContain('ec-deleted');
    });
  });

  describe('allocation rows — edit mode', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
      mockStore.visibleAllocations = [{ ...openAllocation }, { ...zeroTargetAllocation }];
    });

    it('renders name as text input', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const nameInput = rows[0].find(NAME_INPUT);
      expect(nameInput.exists()).toBe(true);
      expect((nameInput.element as HTMLInputElement).value).toBe('Car Insurance');
    });

    it('renders target as EcMoneyField', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const moneyField = rows[0].findAll('td')[2].find('.money-input');
      expect(moneyField.exists()).toBe(true);
    });

    it('renders comment as text input', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const commentInput = rows[0].find(COMMENT_INPUT);
      expect(commentInput.exists()).toBe(true);
      expect((commentInput.element as HTMLInputElement).value).toBe('Annual premium');
    });

    it('keeps current balance as read-only text in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const balanceCell = rows[0].findAll('td')[1];
      expect(balanceCell.find('input').exists()).toBe(false);
      expect(balanceCell.text()).toContain('250.00');
    });

    it('keeps outstanding as read-only in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const outstandingCell = rows[0].findAll('td')[3];
      expect(outstandingCell.find('input').exists()).toBe(false);
    });

    it('keeps status as read-only in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const statusCell = rows[0].findAll('td')[5];
      expect(statusCell.find('input').exists()).toBe(false);
    });

    it('renders delete button with correct title', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const deleteBtn = rows[0].find(DELETE_BTN);
      expect(deleteBtn.exists()).toBe(true);
      expect(getTooltipValue(deleteBtn)).toBe('Delete this obligation');
    });

    it('toggles allocation.deleted when delete button is clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      await rows[0].find(DELETE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.visibleAllocations[0].deleted).toBe(true);
    });

    it('shows undo icon and title when allocation is deleted', async () => {
      mockStore.visibleAllocations = [{ ...openAllocation, deleted: true }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const undoBtn = rows[0].find(UNDO_DELETE_BTN);
      expect(undoBtn.exists()).toBe(true);
      expect(getTooltipValue(undoBtn)).toBe('Restore this deleted obligation');
    });

    it('applies deleted-row styling when allocation is deleted', async () => {
      mockStore.visibleAllocations = [{ ...openAllocation, deleted: true }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].classes()).toContain('ec-deleted');
    });

    it('renders deactivate button with correct title for open allocations', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const deactivateBtn = rows[0].find(DEACTIVATE_BTN);
      expect(deactivateBtn.exists()).toBe(true);
      expect(getTooltipValue(deactivateBtn)).toBe('Close this obligation');
    });

    it('toggles status to closed when deactivate button is clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      await rows[0].find(DEACTIVATE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.visibleAllocations[0].status).toBe('closed');
    });

    it('shows reactivate button with correct title for closed allocations', async () => {
      mockStore.visibleAllocations = [{ ...closedAllocation }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const reactivateBtn = rows[0].find(REACTIVATE_BTN);
      expect(reactivateBtn.exists()).toBe(true);
      expect(getTooltipValue(reactivateBtn)).toBe('Reopen this obligation');
    });

    it('toggles status to open when reactivate button is clicked', async () => {
      mockStore.visibleAllocations = [{ ...closedAllocation }];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      await rows[0].find(REACTIVATE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.visibleAllocations[0].status).toBe('open');
    });
  });

  describe('footer totals row', () => {
    it('renders the total row in tfoot', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      expect(totalRow.exists()).toBe(true);
    });

    it('displays "Total" in the name cell', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const cells = totalRow.findAll('th');
      expect(cells[0].text()).toBe('Total');
    });

    it('displays totalAssignedBalance in the current balance cell', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const cells = totalRow.findAll('th');
      expect(cells[1].text()).toBe('300.00');
    });

    it('displays totalTarget in the target cell', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const cells = totalRow.findAll('th');
      expect(cells[2].text()).toBe('500.00');
    });

    it('displays totalOutstanding in the outstanding cell', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const cells = totalRow.findAll('th');
      expect(cells[3].text()).toContain('250.00');
    });
  });
});
