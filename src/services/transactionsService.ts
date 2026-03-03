import type { AxiosRequestConfig } from "axios";
import type { CreateTransactionRequest, Transaction } from "../types/transaction";
import { http } from "./http";

type RequestOptions = Pick<AxiosRequestConfig, "skipGlobalError">;

export const transactionsService = {
  async listTransactions(): Promise<Transaction[]> {
    const { data } = await http.get<Transaction[]>("/api/transactions");
    return data;
  },

  async createTransaction(payload: CreateTransactionRequest): Promise<Transaction> {
    const { data } = await http.post<Transaction>("/api/transactions", payload);
    return data;
  },

  async deleteTransaction(transactionId: number, options?: RequestOptions): Promise<void> {
    await http.delete(`/api/transactions/${transactionId}`, options);
  },
};
