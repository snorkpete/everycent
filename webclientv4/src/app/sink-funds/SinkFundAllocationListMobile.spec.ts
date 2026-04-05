import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SinkFundAllocationListMobile from './SinkFundAllocationListMobile.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import { useSinkFundStore } from './sinkFundStore';
import { buildSinkFund, buildSinkFundAllocation } from '../../test/factories';

vi.mock('./sinkFundApi', () => ({
  sinkFundApi: {
    getTransactionsForAllocation: vi.fn().mockResolvedValue([]),
  },
}));

// Selectors
const SUMMARY_STRIP = '[data-testid="summary-strip"]';
const SUMMARY_CELL_BALANCE = '[data-testid="summary-cell-balance"]';
const SUMMARY_CELL_UNASSIGNED = '[data-testid="summary-cell-unassigned"]';
const OBLIGATION_CARD = '[data-testid="obligation-card"]';
const CARD_NAME = '[data-testid="card-name"]';
const CARD_BALANCE = '[data-testid="card-balance"]';
const CARD_DETAIL = '[data-testid="card-detail"]';
const DETAIL_TARGET = '[data-testid="detail-target"]';
const DETAIL_OUTSTANDING = '[data-testid="detail-outstanding"]';
const DETAIL_STATUS = '[data-testid="detail-status"]';
const DETAIL_COMMENT = '[data-testid="detail-comment"]';
const VIEW_TRANSACTIONS_BTN = '[data-testid="view-transactions-btn"]';
const TOTALS_FOOTER = '[data-testid="totals-footer"]';

let pinia: Pinia;
let store: ReturnType<typeof useSinkFundStore>;

function buildOpen(overrides = {}) {
  return buildSinkFundAllocation({
    id: 10,
    name: 'Car Insurance',
    current_balance: 25000,
    target: 50000,
    comment: 'Annual premium',
    status: 'open',
    ...overrides,
  });
}

function buildClosed(overrides = {}) {
  return buildSinkFundAllocation({
    id: 11,
    name: 'Old Goal',
    current_balance: 10000,
    target: 10000,
    comment: 'Done',
    status: 'closed',
    ...overrides,
  });
}

function buildZeroTarget(overrides = {}) {
  return buildSinkFundAllocation({
    id: 12,
    name: 'No Target',
    current_balance: 5000,
    target: 0,
    comment: '',
    status: 'open',
    ...overrides,
  });
}

function createWrapper(): VueWrapper {
  return mount(SinkFundAllocationListMobile, {
    props: { dashIfZero: false },
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('SinkFundAllocationListMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    store = useSinkFundStore();
    store.sinkFund = buildSinkFund({
      current_balance: 100000,
      sink_fund_allocations: [buildOpen(), buildZeroTarget()],
    });
  });

  describe('summary strip', () => {
    it('renders the summary strip with balance and unassigned cells', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SUMMARY_STRIP).exists()).toBe(true);
      expect(wrapper.find(SUMMARY_CELL_BALANCE).exists()).toBe(true);
      expect(wrapper.find(SUMMARY_CELL_UNASSIGNED).exists()).toBe(true);
    });

    it('displays sink fund current balance in the balance cell', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SUMMARY_CELL_BALANCE).text()).toContain('1,000.00');
    });

    it('displays unassigned balance in the unassigned cell', () => {
      const wrapper = createWrapper();

      // 100000 current_balance - (25000 + 5000 assigned) = 70000 = "700.00"
      expect(wrapper.find(SUMMARY_CELL_UNASSIGNED).text()).toContain('700.00');
    });

    it('applies balance highlight to the unassigned amount', () => {
      const wrapper = createWrapper();

      const display = wrapper.find(SUMMARY_CELL_UNASSIGNED).find('.money-display');
      expect(display.classes()).toContain('positive');
    });

    it('applies negative balance highlight when unassigned is negative (overspent)', () => {
      // Assign more than the account balance to create a negative unassigned
      store.sinkFund = buildSinkFund({
        current_balance: 10000,
        sink_fund_allocations: [buildOpen({ current_balance: 25000 })],
      });

      const wrapper = createWrapper();

      const display = wrapper.find(SUMMARY_CELL_UNASSIGNED).find('.money-display');
      expect(display.classes()).toContain('negative');
    });
  });

  describe('obligation cards', () => {
    it('renders one card per visible allocation', () => {
      const wrapper = createWrapper();

      expect(wrapper.findAll(OBLIGATION_CARD)).toHaveLength(2);
    });

    it('displays allocation name and current balance in each card', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll(OBLIGATION_CARD);
      expect(cards[0].find(CARD_NAME).text()).toBe('Car Insurance');
      expect(cards[0].find(CARD_BALANCE).text()).toContain('250.00');
      expect(cards[1].find(CARD_NAME).text()).toBe('No Target');
      expect(cards[1].find(CARD_BALANCE).text()).toContain('50.00');
    });

    it('cards are initially collapsed — detail not shown', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('applies closed class to closed allocations when shown', async () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [buildOpen(), buildClosed()],
      });
      store.showDeactivated = true;

      const wrapper = createWrapper();

      const cards = wrapper.findAll(OBLIGATION_CARD);
      expect(cards[0].classes()).not.toContain('obligation-card--closed');
      expect(cards[1].classes()).toContain('obligation-card--closed');
    });
  });

  describe('expand / collapse', () => {
    it('expanding a card shows its detail section', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('clicking an expanded card collapses it', async () => {
      const wrapper = createWrapper();
      const firstCard = wrapper.findAll(OBLIGATION_CARD)[0];

      await firstCard.trigger('click');
      await firstCard.trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('only one card can be expanded at a time', async () => {
      const wrapper = createWrapper();
      const cards = wrapper.findAll(OBLIGATION_CARD);

      await cards[0].trigger('click');
      await cards[1].trigger('click');

      const details = wrapper.findAll(CARD_DETAIL);
      expect(details).toHaveLength(1);
      expect(cards[1].find(CARD_DETAIL).exists()).toBe(true);
    });
  });

  describe('expanded detail', () => {
    it('shows target, outstanding, status and comment', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(DETAIL_TARGET).text()).toContain('500.00');
      expect(wrapper.find(DETAIL_OUTSTANDING).text()).toContain('250.00');
      expect(wrapper.find(DETAIL_STATUS).text()).toContain('open');
      expect(wrapper.find(DETAIL_COMMENT).text()).toContain('Annual premium');
    });

    it('outstanding is zero when allocation has no target', async () => {
      const wrapper = createWrapper();

      // Expand the zeroTarget allocation (second card)
      await wrapper.findAll(OBLIGATION_CARD)[1].trigger('click');

      expect(wrapper.find(DETAIL_OUTSTANDING).text()).toContain('0.00');
    });

    it('shows View Transactions button', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(true);
    });
  });

  describe('view transactions dialog', () => {
    it('dialog is hidden by default', () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('visible')).toBe(false);
    });

    it('opens dialog with allocation id and name when View Transactions is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      await wrapper.find(VIEW_TRANSACTIONS_BTN).trigger('click');

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationId')).toBe(10);
      expect(dialog.props('allocationName')).toBe('Car Insurance');
    });

    it('clicking View Transactions does not collapse the card', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      await wrapper.find(VIEW_TRANSACTIONS_BTN).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });
  });

  describe('totals footer', () => {
    it('renders the totals footer', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(TOTALS_FOOTER).exists()).toBe(true);
    });

    it('displays total assigned balance', () => {
      const wrapper = createWrapper();

      // 25000 + 5000 = 30000 = "300.00"
      expect(wrapper.find(TOTALS_FOOTER).text()).toContain('300.00');
    });
  });

  describe('empty state', () => {
    it('renders no cards when there are no visible allocations', () => {
      store.sinkFund = buildSinkFund({ sink_fund_allocations: [] });

      const wrapper = createWrapper();

      expect(wrapper.findAll(OBLIGATION_CARD)).toHaveLength(0);
    });

    it('shows an empty state message with Edit hint when not in edit mode', () => {
      store.sinkFund = buildSinkFund({ sink_fund_allocations: [] });

      const wrapper = createWrapper();

      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(true);
      expect(emptyState.text()).toContain('Tap Edit');
    });

    it('shows an empty state message with + hint when in edit mode', () => {
      store.sinkFund = buildSinkFund({ sink_fund_allocations: [] });
      store.isEditMode = true;

      const wrapper = createWrapper();

      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(true);
      expect(emptyState.text()).toContain('+');
    });

    it('does not render the empty state when there are allocations', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false);
    });
  });

  describe('auto-expand new obligations', () => {
    it('auto-expands a newly added unsaved obligation', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);

      store.addObligation();
      await wrapper.vm.$nextTick();

      const cards = wrapper.findAll(OBLIGATION_CARD);
      const lastCard = cards[cards.length - 1];
      expect(lastCard.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('does not auto-expand when an existing allocation is shown (not unsaved)', async () => {
      const wrapper = createWrapper();

      // Add a saved allocation (no unsaved flag)
      store.sinkFund?.sink_fund_allocations?.push(
        buildSinkFundAllocation({ id: 99, name: 'Saved one' }),
      );
      await wrapper.vm.$nextTick();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });
  });

  describe('unsaved marker', () => {
    it('applies obligation-card--unsaved class to unsaved allocations', () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [
          buildOpen(),
          buildSinkFundAllocation({ id: undefined, name: '', unsaved: true, status: 'open' }),
        ],
      });

      const wrapper = createWrapper();

      const cards = wrapper.findAll(OBLIGATION_CARD);
      expect(cards[0].classes()).not.toContain('obligation-card--unsaved');
      expect(cards[1].classes()).toContain('obligation-card--unsaved');
    });
  });

  describe('edit mode', () => {
    const NAME_INPUT = '[data-testid="allocation-name-input"]';
    const TARGET_INPUT = '[data-testid="allocation-target-input"]';
    const COMMENT_INPUT = '[data-testid="allocation-comment-input"]';
    const DELETE_BTN = '[data-testid="obligation-delete-btn"]';
    const UNDO_DELETE_BTN = '[data-testid="obligation-restore-btn"]';
    const DEACTIVATE_BTN = '[data-testid="deactivate-btn"]';
    const REACTIVATE_BTN = '[data-testid="reactivate-btn"]';

    beforeEach(() => {
      store.isEditMode = true;
    });

    it('renders name input in collapsed card', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(NAME_INPUT).exists()).toBe(true);
    });

    it('does not render name span when in edit mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CARD_NAME).exists()).toBe(false);
    });

    it('clicking the name input does not expand the card', async () => {
      const wrapper = createWrapper();

      await wrapper.find(NAME_INPUT).trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('updates allocation.name when name input changes', async () => {
      const wrapper = createWrapper();

      const input = wrapper.find(NAME_INPUT);
      await input.setValue('New Name');

      expect(store.sinkFund?.sink_fund_allocations?.[0].name).toBe('New Name');
    });

    it('shows target input, comment input, delete and deactivate buttons when expanded', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(TARGET_INPUT).exists()).toBe(true);
      expect(wrapper.find(COMMENT_INPUT).exists()).toBe(true);
      expect(wrapper.find(DELETE_BTN).exists()).toBe(true);
      expect(wrapper.find(DEACTIVATE_BTN).exists()).toBe(true);
    });

    it('does not show View Transactions button in edit mode', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(VIEW_TRANSACTIONS_BTN).exists()).toBe(false);
    });

    it('updates allocation.comment when comment input changes', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      const input = wrapper.find(COMMENT_INPUT);
      await input.setValue('Updated comment');

      expect(store.sinkFund?.sink_fund_allocations?.[0].comment).toBe('Updated comment');
    });

    it('toggles allocation.deleted when delete button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      await wrapper.find(DELETE_BTN).trigger('click');

      expect(store.sinkFund?.sink_fund_allocations?.[0].deleted).toBe(true);
    });

    it('shows undo button and can restore when allocation is deleted', async () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [buildOpen({ deleted: true }), buildZeroTarget()],
      });

      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      expect(wrapper.find(UNDO_DELETE_BTN).exists()).toBe(true);

      await wrapper.find(UNDO_DELETE_BTN).trigger('click');
      expect(store.sinkFund?.sink_fund_allocations?.[0].deleted).toBe(false);
    });

    it('closes an open allocation when deactivate is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      await wrapper.find(DEACTIVATE_BTN).trigger('click');

      expect(store.sinkFund?.sink_fund_allocations?.[0].status).toBe('closed');
    });

    it('shows reactivate button for closed allocations and reopens them', async () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [buildClosed()],
      });
      store.showDeactivated = true;

      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');
      expect(wrapper.find(REACTIVATE_BTN).exists()).toBe(true);
      expect(wrapper.find(DEACTIVATE_BTN).exists()).toBe(false);

      await wrapper.find(REACTIVATE_BTN).trigger('click');
      expect(store.sinkFund?.sink_fund_allocations?.[0].status).toBe('open');
    });

    it('applies ec-deleted class to card when allocation.deleted is true', () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [buildOpen({ deleted: true }), buildZeroTarget()],
      });

      const wrapper = createWrapper();

      expect(wrapper.findAll(OBLIGATION_CARD)[0].classes()).toContain('ec-deleted');
    });

    it('applies both closed and deleted classes when both apply', () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [buildOpen({ deleted: true, status: 'closed' })],
      });
      store.showDeactivated = true;

      const wrapper = createWrapper();

      const classes = wrapper.findAll(OBLIGATION_CARD)[0].classes();
      expect(classes).toContain('obligation-card--closed');
      expect(classes).toContain('ec-deleted');
    });

    it('expands a card in edit mode via <li> click when clicking outside the name input', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(OBLIGATION_CARD)[0].trigger('click');

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('can expand and collapse an unsaved allocation (no id) via its negative key', async () => {
      store.sinkFund = buildSinkFund({
        current_balance: 100000,
        sink_fund_allocations: [
          buildOpen(),
          buildSinkFundAllocation({ id: undefined, name: '', status: 'open' }),
        ],
      });

      const wrapper = createWrapper();
      const unsavedCard = wrapper.findAll(OBLIGATION_CARD)[1];

      await unsavedCard.trigger('click');
      expect(wrapper.findAll(CARD_DETAIL)).toHaveLength(1);
      expect(unsavedCard.find(CARD_DETAIL).exists()).toBe(true);

      await unsavedCard.trigger('click');
      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });
  });
});
