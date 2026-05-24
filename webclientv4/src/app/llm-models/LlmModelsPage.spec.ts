import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import LlmModelsPage from './LlmModelsPage.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

// Stub useConfirm — capture the last require call so tests can invoke accept
let lastConfirmCall: { accept?: () => void; reject?: () => void } = {};
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: (opts: { accept?: () => void; reject?: () => void }) => {
      lastConfirmCall = opts;
    },
  }),
}));

const DialogStub = {
  name: 'LlmModelEditDialog',
  template: '<div data-testid="edit-dialog" />',
  props: ['visible', 'model', 'initialEditMode'],
  emits: ['update:visible', 'save'],
};

const ConfirmDialogStub = {
  name: 'ConfirmDialog',
  template: '<div data-testid="confirm-dialog" />',
};

const activeModel = {
  id: 1,
  provider: 'anthropic',
  name: 'claude-sonnet-4-6',
  display_name: 'Claude Sonnet',
  active: true,
};

const inactiveModel = {
  id: 2,
  provider: 'openai',
  name: 'gpt-4o',
  display_name: '',
  active: false,
};

function createWrapper(pinia: Pinia): VueWrapper {
  return mount(LlmModelsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: {
        LlmModelEditDialog: DialogStub,
        ConfirmDialog: ConfirmDialogStub,
      },
    },
  });
}

describe('LlmModelsPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    lastConfirmCall = {};
    mockApiGateway.reset();
    mockApiGateway.get('/llm_models', [activeModel, inactiveModel]);
  });

  describe('on mount', () => {
    it('sets the page heading to "Model Registry"', async () => {
      createWrapper(pinia);
      await flushPromises();

      const headingStore = useHeadingStore();
      expect(headingStore.heading).toBe('Model Registry');
    });

    it('calls the API to fetch all models on mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_models');
    });
  });

  describe('model list', () => {
    it('renders all model labels', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="model-label-1"]').text()).toContain('anthropic');
      expect(wrapper.find('[data-testid="model-label-1"]').text()).toContain('Claude Sonnet');
      expect(wrapper.find('[data-testid="model-label-2"]').text()).toContain('openai');
      expect(wrapper.find('[data-testid="model-label-2"]').text()).toContain('gpt-4o');
    });

    it('shows active status badge for active model', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="model-status-1"]').text()).toBe('Active');
    });

    it('shows inactive status badge for inactive model', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="model-status-2"]').text()).toBe('Inactive');
    });

    it('renders an edit button for each model', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="edit-btn-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="edit-btn-2"]').exists()).toBe(true);
    });

    it('renders a delete button for each model', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      expect(wrapper.find('[data-testid="delete-btn-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-btn-2"]').exists()).toBe(true);
    });
  });

  describe('Add Model button', () => {
    it('opens the dialog with an empty model in edit mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="add-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'LlmModelEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('model')).toEqual({});
      expect(dialog.props('initialEditMode')).toBe(true);
    });
  });

  describe('edit button', () => {
    it('opens the dialog with the selected model in view mode', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'LlmModelEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('model')).toEqual(activeModel);
      expect(dialog.props('initialEditMode')).toBe(false);
    });

    it('has a tooltip', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const editBtn = wrapper.find('[data-testid="edit-btn-1"]');
      expect(editBtn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('Refresh button', () => {
    it('calls the API again when clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      expect(apiGateway.get).toHaveBeenCalledTimes(2);
    });

    it('shows loading state while store is loading', async () => {
      vi.mocked(apiGateway.get).mockImplementationOnce(() => new Promise(() => {}));
      const wrapper = createWrapper(pinia);
      await nextTick();

      const allButtons = wrapper.findAllComponents({ name: 'Button' });
      const refreshBtn = allButtons.find((b) => b.attributes('data-testid') === 'refresh-btn')!;
      expect(refreshBtn.props('loading')).toBe(true);
    });
  });

  describe('on save', () => {
    it('calls store.save with the model data from the dialog', async () => {
      mockApiGateway.put('/llm_models/1', activeModel);
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'LlmModelEditDialog' });
      await dialog.vm.$emit('save', activeModel);
      await flushPromises();

      expect(apiGateway.put).toHaveBeenCalledWith('/llm_models/1', { llm_model: activeModel });
    });

    it('closes the dialog and shows success notification after save', async () => {
      mockApiGateway.put('/llm_models/1', activeModel);
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');
      const dialog = wrapper.findComponent({ name: 'LlmModelEditDialog' });
      await dialog.vm.$emit('save', activeModel);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Model saved');
    });

    it('keeps dialog open and shows error notification when save fails', async () => {
      vi.mocked(apiGateway.put).mockRejectedValueOnce(new Error('Server error'));
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="edit-btn-1"]').trigger('click');
      const dialog = wrapper.findComponent({ name: 'LlmModelEditDialog' });
      await dialog.vm.$emit('save', activeModel);
      await flushPromises();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalled();
    });

    it('does not show error notification on clean mount', async () => {
      createWrapper(pinia);
      await flushPromises();

      expect(mockNotifyError).not.toHaveBeenCalled();
    });
  });

  describe('delete button', () => {
    it('opens a confirm dialog when delete is clicked', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');

      expect(lastConfirmCall.accept).toBeDefined();
    });

    it('has a tooltip', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      const deleteBtn = wrapper.find('[data-testid="delete-btn-1"]');
      expect(deleteBtn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('confirm delete', () => {
    it('calls store.destroy and shows success notification when confirmed', async () => {
      mockApiGateway.delete('/llm_models/1', undefined);
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await lastConfirmCall.accept?.();
      await flushPromises();

      expect(apiGateway.delete).toHaveBeenCalledWith('/llm_models/1');
      expect(mockNotifySuccess).toHaveBeenCalledWith('Model deleted');
    });

    it('shows error notification when delete fails', async () => {
      vi.mocked(apiGateway.delete).mockRejectedValueOnce(new Error('Delete failed'));
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      await lastConfirmCall.accept?.();
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalled();
    });

    it('does not delete when confirmation is cancelled', async () => {
      const wrapper = createWrapper(pinia);
      await flushPromises();

      await wrapper.find('[data-testid="delete-btn-1"]').trigger('click');
      // Do not call accept — verify delete was not called
      expect(apiGateway.delete).not.toHaveBeenCalled();
    });
  });
});
