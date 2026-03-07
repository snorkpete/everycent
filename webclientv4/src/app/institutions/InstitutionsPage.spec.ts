import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import InstitutionsPage from './InstitutionsPage.vue';
import type { InstitutionData } from './institution.types';

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

const institution1: InstitutionData = { id: 1, name: 'First Bank' };
const institution2: InstitutionData = { id: 2, name: 'Second Bank' };

const mockStore = reactive({
  institutions: [institution1, institution2] as InstitutionData[],
  loading: false,
  error: null as string | null,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./institutionStore', () => ({
  useInstitutionStore: () => mockStore,
}));

const DialogStub = {
  name: 'InstitutionEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'institution', 'initialEditMode'],
  emits: ['update:visible', 'save'],
};

function mountPage() {
  return mount(InstitutionsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { InstitutionEditDialog: DialogStub },
    },
  });
}

describe('InstitutionsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.institutions = [institution1, institution2];
    mockStore.error = null;
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Financial Institutions"', async () => {
      mountPage();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Financial Institutions');
    });

    it('calls fetchAll on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });
  });

  describe('institution list', () => {
    it('renders all institution names', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain(institution1.name);
      expect(wrapper.text()).toContain(institution2.name);
    });

    it('renders an Edit button for each institution', () => {
      const wrapper = mountPage();

      expect(wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="edit-btn-${institution2.id}"]`).exists()).toBe(true);
    });
  });

  describe('Edit button', () => {
    it('opens the dialog with the selected institution', async () => {
      const wrapper = mountPage();

      await wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('institution')).toEqual(institution1);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = mountPage();

      await wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Institution button', () => {
    it('opens the dialog with an empty institution', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('institution')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
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
    it('calls store.save with the institution data', async () => {
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(institution1);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Institution saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      const wrapper = mountPage();
      await wrapper.find(`[data-testid="edit-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
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
