import apiGateway from '../../api/api-gateway';
import type { ChatSettingsData } from './chatSettings.types';

export const chatSettingsApi = {
  get: () => apiGateway.get<ChatSettingsData>('/chat_settings').then((r) => r.data),

  save: (settings: ChatSettingsData) =>
    apiGateway.post<ChatSettingsData>('/chat_settings', settings).then((r) => r.data),
};
