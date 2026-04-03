import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcDeleteButton from './EcDeleteButton.vue';
import { getTooltipValue } from '../../test/tooltip-helper';

function createWrapper({
  deleted = false as boolean | null | undefined,
  itemLabel = 'item',
  testIdPrefix = '',
}: {
  deleted?: boolean | null | undefined;
  itemLabel?: string;
  testIdPrefix?: string;
} = {}): VueWrapper {
  return mount(EcDeleteButton, {
    props: { deleted, itemLabel, testIdPrefix },
    global: { plugins: [PrimeVue] },
  });
}

describe('EcDeleteButton', () => {
  describe('not deleted state', () => {
    it('shows the trash icon when not deleted', () => {
      const wrapper = createWrapper({ deleted: false });

      expect(wrapper.find('.pi-trash').exists()).toBe(true);
    });

    it('does not show the undo icon when not deleted', () => {
      const wrapper = createWrapper({ deleted: false });

      expect(wrapper.find('.pi-undo').exists()).toBe(false);
    });

    it('shows danger severity when not deleted', () => {
      const wrapper = createWrapper({ deleted: false });
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-danger');
    });

    it('shows delete tooltip text when not deleted', () => {
      const wrapper = createWrapper({ deleted: false, itemLabel: 'transaction' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Delete this transaction');
    });
  });

  describe('deleted state', () => {
    it('shows the undo icon when deleted', () => {
      const wrapper = createWrapper({ deleted: true });

      expect(wrapper.find('.pi-undo').exists()).toBe(true);
    });

    it('does not show the trash icon when deleted', () => {
      const wrapper = createWrapper({ deleted: true });

      expect(wrapper.find('.pi-trash').exists()).toBe(false);
    });

    it('shows secondary severity when deleted', () => {
      const wrapper = createWrapper({ deleted: true });
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-secondary');
    });

    it('shows restore tooltip text when deleted', () => {
      const wrapper = createWrapper({ deleted: true, itemLabel: 'transaction' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Restore this deleted transaction');
    });
  });

  describe('null and undefined deleted prop', () => {
    it('treats null as not deleted (shows trash icon)', () => {
      const wrapper = createWrapper({ deleted: null });

      expect(wrapper.find('.pi-trash').exists()).toBe(true);
      expect(wrapper.find('.pi-undo').exists()).toBe(false);
    });

    it('treats null as not deleted (shows danger severity)', () => {
      const wrapper = createWrapper({ deleted: null });
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-danger');
    });

    it('treats null as not deleted (shows delete tooltip)', () => {
      const wrapper = createWrapper({ deleted: null, itemLabel: 'transaction' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Delete this transaction');
    });

    it('treats undefined as not deleted (shows trash icon)', () => {
      const wrapper = createWrapper({ deleted: undefined });

      expect(wrapper.find('.pi-trash').exists()).toBe(true);
      expect(wrapper.find('.pi-undo').exists()).toBe(false);
    });

    it('treats undefined as not deleted (shows danger severity)', () => {
      const wrapper = createWrapper({ deleted: undefined });
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-danger');
    });
  });

  describe('testIdPrefix prop', () => {
    it('sets delete-btn testid when not deleted', () => {
      const wrapper = createWrapper({ deleted: false, testIdPrefix: 'row-5' });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBe('row-5-delete-btn');
    });

    it('sets restore-btn testid when deleted', () => {
      const wrapper = createWrapper({ deleted: true, testIdPrefix: 'row-5' });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBe('row-5-restore-btn');
    });

    it('sets restore-btn testid when deleted is null treated as false — no, null is not deleted', () => {
      const wrapper = createWrapper({ deleted: null, testIdPrefix: 'row-5' });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBe('row-5-delete-btn');
    });

    it('omits data-testid attribute when testIdPrefix is not provided', () => {
      const wrapper = createWrapper({ deleted: false });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBeUndefined();
    });

    it('omits data-testid attribute when testIdPrefix is empty string', () => {
      const wrapper = createWrapper({ deleted: false, testIdPrefix: '' });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBeUndefined();
    });

    it('supports compound prefix strings', () => {
      const wrapper = createWrapper({ deleted: false, testIdPrefix: 'account-0-tx-2' });
      const btn = wrapper.find('button');

      expect(btn.attributes('data-testid')).toBe('account-0-tx-2-delete-btn');
    });
  });

  describe('toggle emit', () => {
    it('emits toggle when clicked', async () => {
      const wrapper = createWrapper({ deleted: false });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('toggle')).toHaveLength(1);
    });

    it('emits toggle when clicked in deleted state', async () => {
      const wrapper = createWrapper({ deleted: true });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('toggle')).toHaveLength(1);
    });
  });

  describe('itemLabel variations', () => {
    it('uses itemLabel in delete tooltip', () => {
      const wrapper = createWrapper({ deleted: false, itemLabel: 'income' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Delete this income');
    });

    it('uses itemLabel in restore tooltip', () => {
      const wrapper = createWrapper({ deleted: true, itemLabel: 'income' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Restore this deleted income');
    });

    it('works with no itemLabel provided (uses default empty string)', () => {
      const wrapper = createWrapper({ deleted: false, itemLabel: '' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Delete this ');
    });
  });
});
