import apiGateway from '../../api/api-gateway';
import type { LlmModelData } from './llmModel.types';

export const llmModelApi = {
  getAll: () => apiGateway.get<LlmModelData[]>('/llm_models').then((r) => r.data),

  create: (model: LlmModelData) =>
    apiGateway.post<LlmModelData>('/llm_models', { llm_model: model }).then((r) => r.data),

  update: (model: LlmModelData & { id: number }) =>
    apiGateway
      .put<LlmModelData>(`/llm_models/${model.id}`, { llm_model: model })
      .then((r) => r.data),

  destroy: (id: number) => apiGateway.delete<void>(`/llm_models/${id}`).then((r) => r.data),
};
