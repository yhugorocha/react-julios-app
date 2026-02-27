import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { transactionSchema, type TransactionFormValues } from "../schemas/transactionSchemas";
import { categoriesService } from "../services/categoriesService";
import { transactionsService } from "../services/transactionsService";
import { useFeedbackStore } from "../store/feedbackStore";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";
import { mapFieldErrors } from "../utils/error";

const PIE_COLORS = [
  
  "#3b82f6",
  "#f38b2a",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#117864",
];

type CategorySummary = {
  categoryId: string;
  name: string;
  transactionsCount: number;
  totalAmount: number;
  share: number;
  color: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(raw: string) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function buildCategorySummary(
  transactions: Transaction[],
  categoriesById: Map<string, Category>,
  type: Category["type"],
): CategorySummary[] {
  const grouped = new Map<
    string,
    {
      categoryId: string;
      name: string;
      transactionsCount: number;
      totalAmount: number;
      pieAmount: number;
    }
  >();

  for (const transaction of transactions) {
    const category = categoriesById.get(transaction.categoryId);
    if (!category || category.type !== type) {
      continue;
    }

    const name = transaction.categoryName ?? category.name;
    const current = grouped.get(transaction.categoryId);

    if (current) {
      current.transactionsCount += 1;
      current.totalAmount += transaction.amount;
      current.pieAmount += Math.abs(transaction.amount);
      continue;
    }

    grouped.set(transaction.categoryId, {
      categoryId: transaction.categoryId,
      name,
      transactionsCount: 1,
      totalAmount: transaction.amount,
      pieAmount: Math.abs(transaction.amount),
    });
  }

  const sorted = Array.from(grouped.values()).sort((a, b) => b.pieAmount - a.pieAmount);
  const totalPieAmount = sorted.reduce((sum, item) => sum + item.pieAmount, 0);

  return sorted.map((item, index) => ({
    categoryId: item.categoryId,
    name: item.name,
    transactionsCount: item.transactionsCount,
    totalAmount: item.totalAmount,
    share: totalPieAmount > 0 ? item.pieAmount / totalPieAmount : 0,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));
}

function buildPieChartBackground(summary: CategorySummary[]) {
  if (summary.length === 0) {
    return "conic-gradient(#d9e3de 0% 100%)";
  }

  let start = 0;
  const segments = summary.map((item, index) => {
    const slice = index === summary.length - 1 ? 100 - start : item.share * 100;
    const end = start + slice;
    const segment = `${item.color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"category" | "detailed">("detailed");
  const pushSuccess = useFeedbackStore((state) => state.pushSuccess);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: getToday(),
      categoryId: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, transactionsData] = await Promise.all([
          categoriesService.listCategories(),
          transactionsService.listTransactions(),
        ]);
        setCategories(categoriesData);
        setTransactions(transactionsData);
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, []);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const incomeSummary = useMemo(
    () => buildCategorySummary(transactions, categoriesById, "INCOME"),
    [categoriesById, transactions],
  );

  const expenseSummary = useMemo(
    () => buildCategorySummary(transactions, categoriesById, "EXPENSE"),
    [categoriesById, transactions],
  );

  const incomePieChartBackground = useMemo(
    () => buildPieChartBackground(incomeSummary),
    [incomeSummary],
  );

  const expensePieChartBackground = useMemo(
    () => buildPieChartBackground(expenseSummary),
    [expenseSummary],
  );

  const incomeTotalAmount = useMemo(
    () => incomeSummary.reduce((sum, item) => sum + item.totalAmount, 0),
    [incomeSummary],
  );

  const expenseTotalAmount = useMemo(
    () => expenseSummary.reduce((sum, item) => sum + item.totalAmount, 0),
    [expenseSummary],
  );

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
      };
      const created = await transactionsService.createTransaction(payload);
      setTransactions((current) => [created, ...current]);
      pushSuccess("Transacao criada com sucesso.");
      reset({ description: "", amount: 0, date: getToday(), categoryId: values.categoryId });
    } catch (error) {
      const fieldErrors = mapFieldErrors(error);
      if (fieldErrors.description) {
        setError("description", { message: fieldErrors.description });
      }
      if (fieldErrors.amount) {
        setError("amount", { message: fieldErrors.amount });
      }
      if (fieldErrors.date) {
        setError("date", { message: fieldErrors.date });
      }
      if (fieldErrors.categoryId) {
        setError("categoryId", { message: fieldErrors.categoryId });
      }
    }
  };

  return (
    <section className="page-grid">
      <article className="panel">
        <h1>Novo lancamento</h1>
        <p className="subtitle">Acompanhe seus gastos e receitas de forma simples.</p>

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="form-field">
            <span>Descricao</span>
            <input type="text" placeholder="Ex: Compra mercado" {...register("description")} />
            {errors.description && <small className="field-error">{errors.description.message}</small>}
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Valor</span>
              <input type="number" step="0.01" min="0" {...register("amount")} />
              {errors.amount && <small className="field-error">{errors.amount.message}</small>}
            </label>

            <label className="form-field">
              <span>Data</span>
              <input type="date" {...register("date")} />
              {errors.date && <small className="field-error">{errors.date.message}</small>}
            </label>
            <label className="form-field">
            <span>Categoria</span>
            <select {...register("categoryId")}>
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.type === "INCOME" ? "Receita" : "Despesa"})
                </option>
              ))}
            </select>
            {errors.categoryId && <small className="field-error">{errors.categoryId.message}</small>}
          </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Registrar lancamento"}
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Lancamentos</h2>
        {isLoading ? (
          <p>Carregando lancamentos...</p>
        ) : transactions.length === 0 ? (
          <p>Nenhum lancamento cadastrado.</p>
        ) : (
          <>
            <div className="tab-switcher" role="tablist" aria-label="Visualizacao de lancamentos">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "detailed"}
                className={activeTab === "detailed" ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab("detailed")}
              >
                Detalhado
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "category"}
                className={activeTab === "category" ? "tab-button active" : "tab-button"}
                onClick={() => setActiveTab("category")}
              >
                Por categoria
              </button>
            </div>

            {activeTab === "category" ? (
              <div className="category-sections">
                <section className="category-section">
                  <h3>Receitas por categoria</h3>
                  {incomeSummary.length === 0 ? (
                    <p className="subtitle">Nenhuma receita cadastrada.</p>
                  ) : (
                    <div className="category-overview">
                      <section className="pie-card" aria-label="Grafico pizza de receitas por categoria">
                        <div className="pie-chart" style={{ background: incomePieChartBackground }}>
                          <small>Total receitas</small>
                          <strong>{formatCurrency(incomeTotalAmount)}</strong>
                        </div>

                        <ul className="pie-legend">
                          {incomeSummary.map((item) => (
                            <li key={item.categoryId} className="pie-legend-item">
                              <span className="legend-dot" style={{ backgroundColor: item.color }} aria-hidden />
                              <span>{item.name}</span>
                              <span>{formatPercentage(item.share)}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Categoria</th>
                              <th>Qtd.</th>
                              <th>Total</th>
                              <th>Participacao</th>
                            </tr>
                          </thead>
                          <tbody>
                            {incomeSummary.map((item) => (
                              <tr key={item.categoryId}>
                                <td>{item.name}</td>
                                <td>{item.transactionsCount}</td>
                                <td>{formatCurrency(item.totalAmount)}</td>
                                <td>{formatPercentage(item.share)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

                <section className="category-section">
                  <h3>Despesas por categoria</h3>
                  {expenseSummary.length === 0 ? (
                    <p className="subtitle">Nenhuma despesa cadastrada.</p>
                  ) : (
                    <div className="category-overview">
                      <section className="pie-card" aria-label="Grafico pizza de despesas por categoria">
                        <div className="pie-chart" style={{ background: expensePieChartBackground }}>
                          <small>Total despesas</small>
                          <strong>{formatCurrency(expenseTotalAmount)}</strong>
                        </div>

                        <ul className="pie-legend">
                          {expenseSummary.map((item) => (
                            <li key={item.categoryId} className="pie-legend-item">
                              <span className="legend-dot" style={{ backgroundColor: item.color }} aria-hidden />
                              <span>{item.name}</span>
                              <span>{formatPercentage(item.share)}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Categoria</th>
                              <th>Qtd.</th>
                              <th>Total</th>
                              <th>Participacao</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenseSummary.map((item) => (
                              <tr key={item.categoryId}>
                                <td>{item.name}</td>
                                <td>{item.transactionsCount}</td>
                                <td>{formatCurrency(item.totalAmount)}</td>
                                <td>{formatPercentage(item.share)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Descricao</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const category = categoriesById.get(transaction.categoryId);
                      return (
                        <tr key={transaction.id}>
                          <td>{transaction.description}</td>
                          <td>{formatCurrency(transaction.amount)}</td>
                          <td>{formatDate(transaction.date)}</td>
                          <td>{transaction.categoryName ?? category?.name ?? `#${transaction.categoryId}`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  );
}

export default TransactionsPage;
