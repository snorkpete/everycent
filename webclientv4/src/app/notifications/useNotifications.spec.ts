import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdd = vi.fn();
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: mockAdd }),
}));

import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    mockAdd.mockReset();
  });

  it('success shows a success toast with a 3s lifetime', () => {
    const { success } = useNotifications();

    success('Account saved');

    expect(mockAdd).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Account saved',
      life: 3000,
    });
  });

  it('error shows an error toast with a 5s lifetime', () => {
    const { error } = useNotifications();

    error('Save failed');

    expect(mockAdd).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Save failed',
      life: 5000,
    });
  });

  it('info shows an info toast with a 3s lifetime', () => {
    const { info } = useNotifications();

    info('Loading…');

    expect(mockAdd).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info',
      detail: 'Loading…',
      life: 3000,
    });
  });
});
