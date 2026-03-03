import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useForm } from "react-hook-form";
import { categorySchema, type CategoryFormValues } from "../schemas/categorySchemas";
import { categoriesService } from "../services/categoriesService";
import { useFeedbackStore } from "../store/feedbackStore";
import type { Category } from "../types/category";
import { mapFieldErrors } from "../utils/error";

function isCategoryActive(category: Category) {
  return category.active !== false;
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [categoryToConfirm, setCategoryToConfirm] = useState<Category | null>(null);
  const pushError = useFeedbackStore((state) => state.pushError);
  const pushSuccess = useFeedbackStore((state) => state.pushSuccess);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.listCategories();
        setCategories(data.map((category) => ({ ...category, active: category.active ?? true })));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const created = await categoriesService.createCategory(values);
      setCategories((current) => [{ ...created, active: created.active ?? true }, ...current]);
      pushSuccess("Categoria criada com sucesso.");
      reset({ name: "", type: values.type });
    } catch (error) {
      const fieldErrors = mapFieldErrors(error);
      if (fieldErrors.name) {
        setError("name", { message: fieldErrors.name });
      }
      if (fieldErrors.type) {
        setError("type", { message: fieldErrors.type });
      }
    }
  };

  const openToggleCategoryDialog = (category: Category) => {
    setCategoryToConfirm(category);
  };

  const closeToggleCategoryDialog = () => {
    if (updatingCategoryId) {
      return;
    }
    setCategoryToConfirm(null);
  };

  const onConfirmToggleCategory = async () => {
    if (!categoryToConfirm) {
      return;
    }

    const shouldDeactivate = isCategoryActive(categoryToConfirm);
    setUpdatingCategoryId(categoryToConfirm.id);
    try {
      if (shouldDeactivate) {
        await categoriesService.deactivateCategory(categoryToConfirm.id, { skipGlobalError: true });
      } else {
        await categoriesService.activateCategory(categoryToConfirm.id, { skipGlobalError: true });
      }
      setCategories((current) =>
        current.map((item) =>
          item.id === categoryToConfirm.id ? { ...item, active: !shouldDeactivate } : item,
        ),
      );
      pushSuccess(
        shouldDeactivate
          ? "Categoria desativada com sucesso."
          : "Categoria ativada com sucesso.",
      );
      setCategoryToConfirm(null);
    } catch {
      pushError(
        shouldDeactivate
          ? "Não foi possível desativar a categoria."
          : "Não foi possível ativar a categoria.",
      );
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const isConfirmingDeactivation = categoryToConfirm ? isCategoryActive(categoryToConfirm) : false;

  return (
    <section className="page-grid">
      <article className="panel">
        <h1>Categorias</h1>
        <p className="subtitle">Cadastre categorias de receita e despesa para organizar lançamentos.</p>

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-row">
            <label className="form-field">
              <span>Nome</span>
              <input type="text" placeholder="Ex: Mercado" {...register("name")} />
              {errors.name && <small className="field-error">{errors.name.message}</small>}
            </label>
            <label className="form-field">
              <span>Tipo</span>
              <select {...register("type")}>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
              {errors.type && <small className="field-error">{errors.type.message}</small>}
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Criar categoria"}
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Lista</h2>
        {isLoading ? (
          <p>Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p>Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const active = isCategoryActive(category);
                  const isUpdating = updatingCategoryId === category.id;
                  return (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>
                        <span className={category.type === "INCOME" ? "chip chip-income" : "chip chip-expense"}>
                          {category.type === "INCOME" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td>
                        <span className={active ? "chip chip-active" : "chip chip-inactive"}>
                          {active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className={active ? "btn btn-danger-outline" : "btn btn-primary"}
                            onClick={() => openToggleCategoryDialog(category)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Processando..." : active ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <ConfirmDialog
        isOpen={Boolean(categoryToConfirm)}
        title={isConfirmingDeactivation ? "Desativar categoria?" : "Ativar categoria?"}
        description={
          categoryToConfirm
            ? isConfirmingDeactivation
              ? `Tem certeza que deseja desativar a categoria "${categoryToConfirm.name}"?`
              : `Tem certeza que deseja ativar a categoria "${categoryToConfirm.name}"?`
            : ""
        }
        confirmLabel={isConfirmingDeactivation ? "Desativar" : "Ativar"}
        tone={isConfirmingDeactivation ? "danger" : "default"}
        isLoading={Boolean(updatingCategoryId)}
        onCancel={closeToggleCategoryDialog}
        onConfirm={() => void onConfirmToggleCategory()}
      />
    </section>
  );
}

export default CategoriesPage;
