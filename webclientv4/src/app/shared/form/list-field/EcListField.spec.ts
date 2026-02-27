import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Select from 'primevue/select';
import EcListField from './EcListField.vue';
import type { ListItem } from './ec-list-field.types';

describe('EcListField', () => {
  const label = 'Category';
  const items: ListItem[] = [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Transport' },
    { id: 3, name: 'Entertainment' },
  ];

  function mountComponent(props: Record<string, unknown> = {}) {
    return mount(EcListField, {
      props: {
        modelValue: 1,
        label,
        editMode: false,
        items,
        ...props,
      },
      global: {
        plugins: [PrimeVue],
      },
    });
  }

  describe('read-only mode', () => {
    it('displays the label', () => {
      const wrapper = mountComponent();

      expect(wrapper.text()).toContain(label);
    });

    it('displays the selected item name', () => {
      const selectedItem = items[1];
      const wrapper = mountComponent({ modelValue: selectedItem.id });

      expect(wrapper.text()).toContain(selectedItem.name);
    });

    it('displays an empty string when no item matches the value', () => {
      const wrapper = mountComponent({ modelValue: 0 });

      expect(wrapper.find('.value').text()).toBe('');
    });

    it('displays an empty string when modelValue is null', () => {
      const wrapper = mountComponent({ modelValue: null });

      expect(wrapper.find('.value').text()).toBe('');
    });

    it('does not display a Select component', () => {
      const wrapper = mountComponent();

      expect(wrapper.findComponent(Select).exists()).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('displays a Select component', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.findComponent(Select).exists()).toBe(true);
    });

    it('displays the label', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.text()).toContain(label);
    });

    it('passes the items as options to the Select', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.findComponent(Select).props('options')).toEqual(items);
    });

    it('passes the current value to the Select', () => {
      const selectedId = 2;
      const wrapper = mountComponent({ editMode: true, modelValue: selectedId });

      expect(wrapper.findComponent(Select).props('modelValue')).toBe(selectedId);
    });

    it('emits the selected id when the selection changes', async () => {
      const wrapper = mountComponent({ editMode: true });
      const newId = 3;

      wrapper.findComponent(Select).vm.$emit('update:modelValue', newId);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([newId]);
    });
  });

  describe('grouping', () => {
    const foodCategoryId = 10;
    const transportCategoryId = 20;
    const groupedItems: ListItem[] = [
      { id: 1, name: 'Groceries', category_id: foodCategoryId, category: { name: 'Food' } },
      { id: 2, name: 'Restaurant', category_id: foodCategoryId, category: { name: 'Food' } },
      { id: 3, name: 'Bus', category_id: transportCategoryId, category: { name: 'Transport' } },
      { id: 4, name: 'Train', category_id: transportCategoryId, category: { name: 'Transport' } },
    ];

    it('passes grouped options to the Select when groupBy is set', () => {
      const wrapper = mountComponent({
        editMode: true,
        items: groupedItems,
        groupBy: 'category',
      });
      const options = wrapper.findComponent(Select).props('options') as { label: string; items: ListItem[] }[];

      expect(options).toHaveLength(2);
    });

    it('groups items under the correct group labels', () => {
      const wrapper = mountComponent({
        editMode: true,
        items: groupedItems,
        groupBy: 'category',
      });
      const options = wrapper.findComponent(Select).props('options') as { label: string; items: ListItem[] }[];

      expect(options[0].label).toBe('Food');
      expect(options[1].label).toBe('Transport');
    });

    it('places items in the correct groups', () => {
      const wrapper = mountComponent({
        editMode: true,
        items: groupedItems,
        groupBy: 'category',
      });
      const options = wrapper.findComponent(Select).props('options') as { label: string; items: ListItem[] }[];
      const foodGroup = options.find((g) => g.label === 'Food')!;
      const transportGroup = options.find((g) => g.label === 'Transport')!;

      expect(foodGroup.items).toHaveLength(2);
      expect(transportGroup.items).toHaveLength(2);
    });

    it('sorts groups alphabetically by label', () => {
      const reversedItems: ListItem[] = [
        { id: 3, name: 'Bus', category_id: transportCategoryId, category: { name: 'Transport' } },
        { id: 1, name: 'Groceries', category_id: foodCategoryId, category: { name: 'Food' } },
      ];
      const wrapper = mountComponent({
        editMode: true,
        items: reversedItems,
        groupBy: 'category',
      });
      const options = wrapper.findComponent(Select).props('options') as { label: string }[];

      expect(options[0].label).toBe('Food');
      expect(options[1].label).toBe('Transport');
    });

    it('passes flat options when groupBy is not set', () => {
      const wrapper = mountComponent({ editMode: true });
      const options = wrapper.findComponent(Select).props('options');

      expect(options).toEqual(items);
    });

    it('displays the selected item name in read-only mode with grouped items', () => {
      const selectedItem = groupedItems[1]; // Restaurant
      const wrapper = mountComponent({
        items: groupedItems,
        groupBy: 'category',
        modelValue: selectedItem.id,
      });

      expect(wrapper.text()).toContain(selectedItem.name);
    });
  });
});
