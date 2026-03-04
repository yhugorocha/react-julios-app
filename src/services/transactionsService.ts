import type { AxiosRequestConfig } from "axios";
import type { CreateTransactionRequest, Transaction } from "../types/transaction";
import { http } from "./http";

type RequestOptions = Pick<AxiosRequestConfig, "skipGlobalError">;

export const transactionsService = {
  async listTransactions(month?: string, options?: RequestOptions): Promise<Transaction[]> {
    const config: AxiosRequestConfig = { ...options };
    if (month) {
      config.params = { month };
    }
    const { data } = await http.get<Transaction[]>("/api/transactions", config);
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
