import type { TransactionData } from '../transaction.types';
import { abnAmroBankImporter } from './abnAmroBankImporter';
import { abnAmroCreditCardImporter } from './abnAmroCreditCardImporter';
import { scotiaImporter } from './scotiaImporter';

export function transactionImporter(
  input: string,
  startDate: string,
  endDate: string,
  importType: string | undefined,
): TransactionData[] {
  switch (importType) {
    case 'abn-amro-bank':
      return abnAmroBankImporter(input, startDate, endDate);
    case 'abn-amro-creditcard':
      return abnAmroCreditCardImporter(input, startDate, endDate);
    case 'new-bank-account':
      return scotiaImporter(input, startDate, endDate);
    default:
      return [];
  }
}
