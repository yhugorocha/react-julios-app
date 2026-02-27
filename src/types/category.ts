export type CategoryType = "INCOME" | "EXPENSE";

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}
