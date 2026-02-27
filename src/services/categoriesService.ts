import type { Category, CreateCategoryRequest } from "../types/category";
import { http } from "./http";

export const categoriesService = {
  async listCategories(): Promise<Category[]> {
    const { data } = await http.get<Category[]>("/api/categories");
    return data;
  },

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    const { data } = await http.post<Category>("/api/categories", payload);
    return data;
  },
};

