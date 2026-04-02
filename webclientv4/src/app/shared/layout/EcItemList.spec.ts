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
  } = {},
): VueWrapper {
  return mount(EcItemList, {
    props: {
      items: options.items ?? items,
      ...(options.keyField !== undefined && { keyField: options.keyField }),
      ...(options.actionsRight !== undefined && { actionsRight: options.actionsRight }),
    },
    slots: {
      item: `<template #item="{ item }"><span class="item-content">{{ item.name }}</span><button class="action-btn">Edit</button></template>`,
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
      const customItems = [
        { id: 1, name: 'Alpha', code: 'A' },
        { id: 2, name: 'Beta', code: 'B' },
      ];

      const wrapper = mount(EcItemList, {
        props: { items: customItems, keyField: 'code' },
        slots: {
          item: `<template #item="{ item }"><span>{{ item.name }}</span></template>`,
        },
      });

      const listItems = wrapper.findAll('li.ec-item-list__item');
      expect(listItems).toHaveLength(2);
      expect(listItems[0].text()).toBe('Alpha');
      expect(listItems[1].text()).toBe('Beta');
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
});
