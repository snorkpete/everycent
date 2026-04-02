import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import AllocationCategoriesPage from './AllocationCategoriesPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { allocationCategoryApi } from './allocationCategoryApi';
import { buildAllocationCategory } from '../../test/factories';

vi.mock('./allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const category1 = buildAllocationCategory({ id: 1, name: 'Groceries' });
const category2 = buildAllocationCategory({ id: 2, name: 'Utilities' });

const DialogStub = {
  name: 'AllocationCategoryEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'allocationCategory', 'initialEditMode'],
  emits: ['update:visible', 'save'],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(AllocationCategoriesPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { AllocationCategoryEditDialog: DialogStub },
    },
  });
}

describe('AllocationCategoriesPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([category1, category2]);
    vi.mocked(allocationCategoryApi.create).mockResolvedValue(category1);
    vi.mocked(allocationCategoryApi.update).mockResolvedValue(category1);
  });

  describe('on mount', () => {
    it('sets the page heading to "Allocation Categories"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Allocation Categories');
    });

    it('calls the API to fetch all categories on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(allocationCategoryApi.getAll).toHaveBeenCalled();
    });
  });

  describe('category list', () => {
    it('renders all category names', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain(category1.name);
      expect(wrapper.text()).toContain(category2.name);
    });

    it('renders an Edit button for each category', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="edit-btn-${category2.id}"]`).exists()).toBe(true);
    });
  });

  describe('Edit button', () => {
    it('opens the dialog with the selected category', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationCategory')).toEqual(category1);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Allocation Category button', () => {
    it('opens the dialog with an empty category', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationCategory')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls the API to fetch all categories again', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(allocationCategoryApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });
  });

  describe('on save', () => {
    it('calls the API to update the category when it has an id', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await flushPromises();

      expect(allocationCategoryApi.update).toHaveBeenCalledWith(category1);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Allocation category saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      vi.mocked(allocationCategoryApi.update).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await flushPromises();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith('Server error');
    });

    it('does not show an error toast on a clean mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });
});
