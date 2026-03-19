import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import AllocationCategoriesPage from './AllocationCategoriesPage.vue';
import type { AllocationCategoryData } from './allocationCategory.types';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
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

const category1: AllocationCategoryData = { id: 1, name: 'Groceries' };
const category2: AllocationCategoryData = { id: 2, name: 'Utilities' };

const mockStore = reactive({
  allocationCategories: [category1, category2] as AllocationCategoryData[],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./allocationCategoryStore', () => ({
  useAllocationCategoryStore: () => mockStore,
}));

const DialogStub = {
  name: 'AllocationCategoryEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'allocationCategory', 'initialEditMode'],
  emits: ['update:visible', 'save'],
};

function mountPage() {
  return mount(AllocationCategoriesPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { AllocationCategoryEditDialog: DialogStub },
    },
  });
}

describe('AllocationCategoriesPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.allocationCategories = [category1, category2];
    mockStore.error = null;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Allocation Categories"', async () => {
      mountPage();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Allocation Categories');
    });

    it('calls fetchAll on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });
  });

  describe('category list', () => {
    it('renders all category names', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain(category1.name);
      expect(wrapper.text()).toContain(category2.name);
    });

    it('renders an Edit button for each category', () => {
      const wrapper = mountPage();

      expect(wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="edit-btn-${category2.id}"]`).exists()).toBe(true);
    });
  });

  describe('Edit button', () => {
    it('opens the dialog with the selected category', async () => {
      const wrapper = mountPage();

      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationCategory')).toEqual(category1);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = mountPage();

      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Allocation Category button', () => {
    it('opens the dialog with an empty category', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationCategory')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls fetchAll', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });
  });

  describe('on save', () => {
    it('calls store.save with the category data', async () => {
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(category1);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Allocation category saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${category1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'AllocationCategoryEditDialog' });
      await dialog.vm.$emit('save', category1);
      await nextTick();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });

    it('does not show an error toast on a clean mount', async () => {
      mountPage();
      await nextTick();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });
});
