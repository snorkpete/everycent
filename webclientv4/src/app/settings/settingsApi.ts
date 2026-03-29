import apiGateway from '../../api/api-gateway';
import type { SettingsData } from './settings.types';

export const settingsApi = {
  get: () => apiGateway.get<SettingsData>('/settings').then((r) => r.data),

  save: (settings: SettingsData) =>
    apiGateway.post<SettingsData>('/settings', settings).then((r) => r.data),
};
