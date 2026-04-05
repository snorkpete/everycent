import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import InstitutionsPage from './InstitutionsPage.vue';
import { useInstitutionStore } from './institutionStore';
import { useHeadingStore } from '../toolbar/headingStore';
import { institutionApi } from './institutionApi';
import { buildInstitution } from '../../test/factories';

vi.mock('./institutionApi', () => ({
  institutionApi: {
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

const institution1 = buildInstitution({ id: 1, name: 'First Bank' });
const institution2 = buildInstitution({ id: 2, name: 'Second Bank' });

const DialogStub = {
  name: 'InstitutionEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'institution', 'initialEditMode'],
  emits: ['update:visible', 'save'],
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(InstitutionsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { InstitutionEditDialog: DialogStub },
    },
  });
}

describe('InstitutionsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    vi.mocked(institutionApi.getAll).mockResolvedValue([institution1, institution2]);
    vi.mocked(institutionApi.create).mockResolvedValue(institution1);
    vi.mocked(institutionApi.update).mockResolvedValue(institution1);
  });

  describe('on mount', () => {
    it('sets the page heading to "Financial Institutions"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Financial Institutions');
    });

    it('calls the API to fetch all institutions on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(institutionApi.getAll).toHaveBeenCalled();
    });
  });

  describe('institution list', () => {
    it('renders all institution names', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.text()).toContain(institution1.name);
      expect(wrapper.text()).toContain(institution2.name);
    });

    it('renders a View button for each institution', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).exists()).toBe(true);
      expect(wrapper.find(`[data-testid="view-btn-${institution2.id}"]`).exists()).toBe(true);
    });

    it('renders a clickable name link for each institution', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find(`[data-testid="institution-link-${institution1.id}"]`).exists()).toBe(
        true,
      );
      expect(wrapper.find(`[data-testid="institution-link-${institution2.id}"]`).exists()).toBe(
        true,
      );
    });
  });

  describe('institution name link', () => {
    it('opens the dialog with the selected institution in view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find(`[data-testid="institution-link-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('institution')).toEqual(institution1);
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('View button', () => {
    it('opens the dialog with the selected institution', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('institution')).toEqual(institution1);
    });

    it('opens the dialog in view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(false);
    });
  });

  describe('Add Institution button', () => {
    it('opens the dialog with an empty institution', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('institution')).toEqual({});
    });

    it('opens the dialog in edit mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('Refresh button', () => {
    it('calls the API to fetch all institutions again', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(institutionApi.getAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });

    it('passes loading=true to the Refresh button while the store is loading', async () => {
      // Make getAll hang to keep loading=true
      vi.mocked(institutionApi.getAll).mockImplementation(() => new Promise(() => {}));
      const wrapper = createWrapper(pinia);
      await nextTick();

      const store = useInstitutionStore();
      expect(store.loading).toBe(true);

      const allButtons = wrapper.findAllComponents({ name: 'Button' });
      const refreshBtn = allButtons.find((b) => b.attributes('data-testid') === 'refresh-btn')!;
      expect(refreshBtn.props('loading')).toBe(true);
    });

    it('passes loading=false to the Refresh button when the store is not loading', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const store = useInstitutionStore();
      expect(store.loading).toBe(false);

      const allButtons = wrapper.findAllComponents({ name: 'Button' });
      const refreshBtn = allButtons.find((b) => b.attributes('data-testid') === 'refresh-btn')!;
      expect(refreshBtn.props('loading')).toBe(false);
    });
  });

  describe('on save', () => {
    it('calls the API to update the institution when it has an id', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
      await flushPromises();

      expect(institutionApi.update).toHaveBeenCalledWith(institution1);
    });

    it('closes the dialog and shows a success toast after a successful save', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Institution saved');
    });

    it('keeps the dialog open and shows an error toast when save fails', async () => {
      vi.mocked(institutionApi.update).mockRejectedValue(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();
      await wrapper.find(`[data-testid="view-btn-${institution1.id}"]`).trigger('click');

      const dialog = wrapper.findComponent({ name: 'InstitutionEditDialog' });
      await dialog.vm.$emit('save', institution1);
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
