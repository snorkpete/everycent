import apiGateway from '../../api/api-gateway';

interface LastUpdateResponse {
  id?: number;
  transaction_date?: string;
}

export const homeApi = {
  // Backend returns the most recent transaction by transaction_date, or a
  // synthetic Transaction (no id) with today's date when there are no
  // transactions. We return null in the latter case so the UI can show a
  // distinct "no transactions yet" state.
  getLastTransactionDate: (): Promise<string | null> =>
    apiGateway.get<LastUpdateResponse>('/transactions/last_update').then((r) => {
      if (r.data.id == null) return null;
      return r.data.transaction_date ?? null;
    }),
};
