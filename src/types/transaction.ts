export interface CreateTransactionRequest {
  description: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  categoryName?: string;
}
