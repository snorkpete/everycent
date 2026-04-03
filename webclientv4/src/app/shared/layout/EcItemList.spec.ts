import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import EcItemList from './EcItemList.vue';

interface TestItem {
  id: number;
  name: string;
  [key: string]: unknown;
}

const items: TestItem[] = [
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' },
  { id: 3, name: 'Third' },
];

function createWrapper(
  options: {
    items?: TestItem[];
    keyField?: string;
    actionsRight?: boolean;
    actionsPosition?: 'top' | 'bottom';
    slots?: Record<string, string>;
  } = {},
): VueWrapper {
  return mount(EcItemList, {
    props: {
      items: options.items ?? items,
      ...(options.keyField !== undefined && { keyField: options.keyField }),
      ...(options.actionsRight !== undefined && { actionsRight: options.actionsRight }),
      ...(options.actionsPosition !== undefined && { actionsPosition: options.actionsPosition }),
    },
    slots: {
      item: `<template #item="{ item }"><span class="item-content">{{ item.name }}</span><button class="action-btn">Edit</button></template>`,
      ...options.slots,
    },
  });
}

describe('EcItemList', () => {
  describe('rendering', () => {
    it('renders a ul element with the ec-item-list class', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('ul.ec-item-list').exists()).toBe(true);
    });

    it('renders a li for each item', () => {
      const wrapper = createWrapper();

      const listItems = wrapper.findAll('li.ec-item-list__item');
      expect(listItems).toHaveLength(3);
    });

    it('renders slot content for each item', () => {
      const wrapper = createWrapper();

      const contents = wrapper.findAll('.item-content');
      expect(contents).toHaveLength(3);
      expect(contents[0].text()).toBe('First');
      expect(contents[1].text()).toBe('Second');
      expect(contents[2].text()).toBe('Third');
    });

    it('renders an empty list when items is empty', () => {
      const wrapper = createWrapper({ items: [] });

      expect(wrapper.find('ul.ec-item-list').exists()).toBe(true);
      expect(wrapper.findAll('li.ec-item-list__item')).toHaveLength(0);
    });
  });

  describe('keyField', () => {
    it('uses id as the default key field', () => {
      const wrapper = createWrapper();

      const listItems = wrapper.findAll('li.ec-item-list__item');
      expect(listItems).toHaveLength(3);
    });

    it('uses a custom key field when provided', () => {
      const wrapper = createWrapper({
        items: [
          { id: 1, name: 'Alpha', code: 'A' },
          { id: 2, name: 'Beta', code: 'B' },
        ],
        keyField: 'code',
      });

      const listItems = wrapper.findAll('li.ec-item-list__item');
      expect(listItems).toHaveLength(2);
      expect(listItems[0].text()).toContain('Alpha');
      expect(listItems[1].text()).toContain('Beta');
    });
  });

  describe('actionsRight', () => {
    it('applies actions-right class by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('ul.ec-item-list').classes()).toContain('ec-item-list--actions-right');
    });

    it('applies actions-right class when actionsRight is true', () => {
      const wrapper = createWrapper({ actionsRight: true });

      expect(wrapper.find('ul.ec-item-list').classes()).toContain('ec-item-list--actions-right');
    });

    it('does not apply actions-right class when actionsRight is false', () => {
      const wrapper = createWrapper({ actionsRight: false });

      expect(wrapper.find('ul.ec-item-list').classes()).not.toContain(
        'ec-item-list--actions-right',
      );
    });
  });

  describe('#page-actions slot', () => {
    it('renders content in an action bar', () => {
      const wrapper = createWrapper({
        slots: {
          'page-actions': '<button class="test-action">Add</button>',
        },
      });

      const actionBar = wrapper.find('.ec-item-list__action-bar');
      expect(actionBar.exists()).toBe(true);
      expect(actionBar.find('.test-action').exists()).toBe(true);
    });

    it('wraps page-actions content in a flex container', () => {
      const wrapper = createWrapper({
        slots: {
          'page-actions': '<button>Add</button><button>Refresh</button>',
        },
      });

      const actionsWrapper = wrapper.find('.ec-item-list__page-actions');
      expect(actionsWrapper.exists()).toBe(true);
      expect(actionsWrapper.findAll('button')).toHaveLength(2);
    });
  });

  describe('#controls slot', () => {
    it('renders content in an action bar', () => {
      const wrapper = createWrapper({
        slots: {
          controls: '<label class="test-control">Toggle</label>',
        },
      });

      const actionBar = wrapper.find('.ec-item-list__action-bar');
      expect(actionBar.exists()).toBe(true);
      expect(actionBar.find('.test-control').exists()).toBe(true);
    });
  });

  describe('action bar with both slots', () => {
    it('renders both slots in the same action bar row', () => {
      const wrapper = createWrapper({
        slots: {
          controls: '<label class="test-control">Toggle</label>',
          'page-actions': '<button class="test-action">Add</button>',
        },
      });

      const actionBars = wrapper.findAll('.ec-item-list__action-bar');
      expect(actionBars).toHaveLength(1);
      expect(actionBars[0].find('.test-control').exists()).toBe(true);
      expect(actionBars[0].find('.test-action').exists()).toBe(true);
    });
  });

  describe('action bar visibility', () => {
    it('does not render the action bar when neither slot is provided', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.ec-item-list__action-bar').exists()).toBe(false);
    });
  });

  describe('actionsPosition prop', () => {
    it('defaults to top (no bottom modifier class on action bar)', () => {
      const wrapper = createWrapper({
        slots: {
          'page-actions': '<button>Add</button>',
        },
      });

      const actionBar = wrapper.find('.ec-item-list__action-bar');
      expect(actionBar.exists()).toBe(true);
      expect(actionBar.classes()).not.toContain('ec-item-list__action-bar--bottom');
    });

    it('puts action bar after list when actionsPosition is bottom', () => {
      const wrapper = createWrapper({
        actionsPosition: 'bottom',
        slots: {
          'page-actions': '<button>Add</button>',
        },
      });

      const container = wrapper.find('.ec-item-list-container');
      // With CSS order, DOM order stays the same but visual order changes
      // Check that the action bar has the bottom modifier class
      const actionBar = container.find('.ec-item-list__action-bar');
      expect(actionBar.classes()).toContain('ec-item-list__action-bar--bottom');
    });
  });
});
