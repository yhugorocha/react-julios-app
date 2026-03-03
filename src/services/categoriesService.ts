import type { AxiosRequestConfig } from "axios";
import type { Category, CreateCategoryRequest } from "../types/category";
import { http } from "./http";

type RequestOptions = Pick<AxiosRequestConfig, "skipGlobalError">;

export const categoriesService = {
  async listCategories(): Promise<Category[]> {
    const { data } = await http.get<Category[]>("/api/categories");
    return data;
  },

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    const { data } = await http.post<Category>("/api/categories", payload);
    return data;
  },

  async deactivateCategory(categoryId: string, options?: RequestOptions): Promise<void> {
    await http.patch(`/api/categories/${categoryId}/deactivate`, undefined, options);
  },

  async activateCategory(categoryId: string, options?: RequestOptions): Promise<void> {
    await http.patch(`/api/categories/${categoryId}/activate`, undefined, options);
  },
};
