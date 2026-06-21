import apiGateway from '../../api/api-gateway';
import type { ConversationTurnDto } from './chat.types';

export const conversationTurnApi = {
  submitTurn: (turn: ConversationTurnDto) =>
    apiGateway.post<{ steps_created: number }>('/mcp/conversation_turns', turn).then((r) => r.data),
};
