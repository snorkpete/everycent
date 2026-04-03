import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcShowTransactionsButton from './EcShowTransactionsButton.vue';
import { getTooltipValue } from '../../test/tooltip-helper';

function createWrapper(): VueWrapper {
  return mount(EcShowTransactionsButton, {
    global: { plugins: [PrimeVue] },
  });
}

describe('EcShowTransactionsButton', () => {
  it('shows the eye icon', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('.pi-eye').exists()).toBe(true);
  });

  it('has tooltip text about showing transactions', () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('button');

    expect(getTooltipValue(btn)).toBe('Show transactions for this allocation');
  });

  it('emits click when button is clicked', async () => {
    const wrapper = createWrapper();

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('uses secondary severity', () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('button');

    expect(btn.classes()).toContain('p-button-secondary');
  });
});
