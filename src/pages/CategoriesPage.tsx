import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { categorySchema, type CategoryFormValues } from "../schemas/categorySchemas";
import { categoriesService } from "../services/categoriesService";
import { useFeedbackStore } from "../store/feedbackStore";
import type { Category } from "../types/category";
import { mapFieldErrors } from "../utils/error";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setCategories(data);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCategories();
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const created = await categoriesService.createCategory(values);
      setCategories((current) => [created, ...current]);
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
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>
                      <span
                        className={
                          category.type === "INCOME"
                            ? "chip chip-income"
                            : "chip chip-expense"
                        }
                      >
                        {category.type === "INCOME" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default CategoriesPage;

