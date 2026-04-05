import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SinkFundsToolbarMobile from './SinkFundsToolbarMobile.vue';
import { useSinkFundStore } from './sinkFundStore';
import { buildSinkFund } from '../../test/factories';

// Selectors
const SINK_FUND_SELECT = '[data-testid="sink-fund-select"]';
const DASH_ZERO_TOGGLE = '[data-testid="dash-zero-toggle"]';
const SHOW_CLOSED_TOGGLE = '[data-testid="show-closed-toggle"]';
const CLOSED_LABEL = '[data-testid="closed-label"]';
const TRANSFER_BTN = '[data-testid="transfer-btn"]';
const EDIT_BTN = '[data-testid="edit-btn"]';
const ADD_OBLIGATION_BTN = '[data-testid="add-obligation-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';

const sinkFundA = buildSinkFund({ id: 1, name: 'Emergency Fund' });
const sinkFundB = buildSinkFund({ id: 2, name: 'Holiday Fund' });

type MountOptions = {
  selectedSinkFundId?: number | null;
  dashIfZero?: boolean;
};

describe('SinkFundsToolbarMobile', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    const store = useSinkFundStore();
    store.sinkFunds = [sinkFundA, sinkFundB];
  });

  function createWrapper(options: MountOptions = {}): VueWrapper {
    return mount(SinkFundsToolbarMobile, {
      props: {
        selectedSinkFundId: options.selectedSinkFundId ?? null,
        dashIfZero: options.dashIfZero ?? false,
      },
      global: {
        plugins: [PrimeVue, pinia],
      },
    });
  }

  describe('sink fund selector', () => {
    it('renders a sink fund select dropdown', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent(SINK_FUND_SELECT).exists()).toBe(true);
    });

    it('passes store sinkFunds as options', () => {
      const wrapper = createWrapper();

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      expect(select.props()).toHaveProperty('options', [sinkFundA, sinkFundB]);
    });

    it('binds selectedSinkFundId to the dropdown value', () => {
      const wrapper = createWrapper({ selectedSinkFundId: 2 });

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      expect(select.props()).toHaveProperty('modelValue', 2);
    });

    it('emits update:selectedSinkFundId when selection changes', async () => {
      const wrapper = createWrapper({ selectedSinkFundId: 1 });

      const select = wrapper.findComponent(SINK_FUND_SELECT) as unknown as VueWrapper;
      await select.vm.$emit('update:modelValue', 2);

      expect(wrapper.emitted('update:selectedSinkFundId')).toEqual([[2]]);
    });
  });

  describe('dash-zero toggle', () => {
    it('renders the dash-zero toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(DASH_ZERO_TOGGLE).exists()).toBe(true);
    });

    it('emits update:dashIfZero with the negated value when clicked', async () => {
      const wrapper = createWrapper({ dashIfZero: false });

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');

      expect(wrapper.emitted('update:dashIfZero')).toEqual([[true]]);
    });

    it('emits false when clicking while dashIfZero is true', async () => {
      const wrapper = createWrapper({ dashIfZero: true });

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');

      expect(wrapper.emitted('update:dashIfZero')).toEqual([[false]]);
    });
  });

  describe('show-closed toggle', () => {
    it('renders the show-closed toggle switch and "Closed" label', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SHOW_CLOSED_TOGGLE).exists()).toBe(true);
      expect(wrapper.find(CLOSED_LABEL).text()).toBe('Closed');
    });

    it('reflects store.showDeactivated', async () => {
      const store = useSinkFundStore();
      store.showDeactivated = true;

      const wrapper = createWrapper();

      const toggle = wrapper.findComponent(SHOW_CLOSED_TOGGLE) as unknown as VueWrapper;
      expect(toggle.props()).toHaveProperty('modelValue', true);
    });

    it('updates store.showDeactivated when toggled', async () => {
      const store = useSinkFundStore();
      store.showDeactivated = false;

      const wrapper = createWrapper();

      const toggle = wrapper.findComponent(SHOW_CLOSED_TOGGLE) as unknown as VueWrapper;
      await toggle.vm.$emit('update:modelValue', true);

      expect(store.showDeactivated).toBe(true);
    });
  });

  describe('edit-mode buttons (not in edit mode)', () => {
    it('shows Edit and Transfer buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(true);
    });

    it('does not show Save, Cancel, or Add Obligation buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(false);
    });

    it('emits transfer when the Transfer icon button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(TRANSFER_BTN).trigger('click');

      expect(wrapper.emitted('transfer')).toHaveLength(1);
    });

    it('enters store edit mode when Edit is clicked', async () => {
      const store = useSinkFundStore();
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(store.isEditMode).toBe(true);
    });
  });

  describe('edit-mode buttons (in edit mode)', () => {
    beforeEach(() => {
      const store = useSinkFundStore();
      store.enterEditMode();
    });

    it('shows Add Obligation, Save, and Cancel buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_OBLIGATION_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });

    it('does not show Edit or Transfer buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
      expect(wrapper.find(TRANSFER_BTN).exists()).toBe(false);
    });

    it('emits addObligation when Add is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADD_OBLIGATION_BTN).trigger('click');

      expect(wrapper.emitted('addObligation')).toHaveLength(1);
    });

    it('emits save when Save is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(SAVE_BTN).trigger('click');

      expect(wrapper.emitted('save')).toHaveLength(1);
    });

    it('emits cancel when Cancel is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CANCEL_BTN).trigger('click');

      expect(wrapper.emitted('cancel')).toHaveLength(1);
    });
  });
});
