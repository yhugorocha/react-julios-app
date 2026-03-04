// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TransactionsPage from "./TransactionsPage";
import { categoriesService } from "../services/categoriesService";
import { transactionsService } from "../services/transactionsService";
import type { Category } from "../types/category";
import type { Transaction } from "../types/transaction";

vi.mock("../services/categoriesService", () => ({
  categoriesService: {
    listCategories: vi.fn(),
  },
}));

vi.mock("../services/transactionsService", () => ({
  transactionsService: {
    listTransactions: vi.fn(),
    createTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
}));

const mockedCategoriesService = vi.mocked(categoriesService);
const mockedTransactionsService = vi.mocked(transactionsService);

const categoriesFixture: Category[] = [
  {
    id: "f2a6c43b-d9ec-4eb6-a101-171657f69313",
    name: "Salário",
    type: "INCOME",
    active: true,
  },
  {
    id: "8f0447e3-42ec-4dbc-b219-1216fa8fd5f0",
    name: "Mercado",
    type: "EXPENSE",
    active: true,
  },
];

function getCurrentMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function formatMonthLabel(month: string) {
  const [yearPart, monthPart] = month.split("-");
  const date = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return `${monthName}/${yearPart}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function renderPage(path = "/transactions") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/transactions" element={<TransactionsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TransactionsPage month filter", () => {
  beforeEach(() => {
    mockedCategoriesService.listCategories.mockResolvedValue(categoriesFixture);
    mockedTransactionsService.listTransactions.mockResolvedValue([]);
  });

  it("abre no mês atual e chama a API com month atual", async () => {
    const expectedMonth = getCurrentMonth();

    renderPage();

    await waitFor(() => {
      expect(mockedTransactionsService.listTransactions).toHaveBeenCalledWith(expectedMonth, {
        skipGlobalError: true,
      });
    });

    expect(screen.getByText(formatMonthLabel(expectedMonth))).toBeInTheDocument();
  });

  it("navega para mês anterior e próximo recarregando a API", async () => {
    renderPage("/transactions?month=2026-03");

    await waitFor(() => {
      expect(mockedTransactionsService.listTransactions).toHaveBeenCalledWith("2026-03", {
        skipGlobalError: true,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Mês anterior" }));

    await waitFor(() => {
      expect(mockedTransactionsService.listTransactions).toHaveBeenCalledWith("2026-02", {
        skipGlobalError: true,
      });
    });
    expect(screen.getByText("fevereiro/2026")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Próximo mês" }));

    await waitFor(() => {
      expect(mockedTransactionsService.listTransactions).toHaveBeenCalledWith("2026-03", {
        skipGlobalError: true,
      });
    });
    expect(screen.getByText("março/2026")).toBeInTheDocument();
  });

  it("respeita o month vindo da URL na chamada da API", async () => {
    renderPage("/transactions?month=2025-12");

    await waitFor(() => {
      expect(mockedTransactionsService.listTransactions).toHaveBeenCalledWith("2025-12", {
        skipGlobalError: true,
      });
    });

    expect(screen.getByText("dezembro/2025")).toBeInTheDocument();
  });

  it("exibe estado vazio para o mês selecionado", async () => {
    mockedTransactionsService.listTransactions.mockResolvedValue([]);

    renderPage("/transactions?month=2026-04");

    expect(await screen.findByText("Nenhum lançamento cadastrado em abril/2026.")).toBeInTheDocument();
  });

  it("exibe os três cards de resumo no detalhado com base no mês", async () => {
    const monthTransactions: Transaction[] = [
      {
        id: 1,
        description: "Salário",
        amount: 1200,
        date: "2026-03-05",
        categoryId: categoriesFixture[0].id,
        categoryName: categoriesFixture[0].name,
      },
      {
        id: 2,
        description: "Supermercado",
        amount: 450,
        date: "2026-03-06",
        categoryId: categoriesFixture[1].id,
        categoryName: categoriesFixture[1].name,
      },
    ];
    mockedTransactionsService.listTransactions.mockResolvedValue(monthTransactions);

    renderPage("/transactions?month=2026-03");

    expect(await screen.findByText("Receitas")).toBeInTheDocument();
    expect(screen.getByText("Despesas")).toBeInTheDocument();
    expect(screen.getByText("Saldo")).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(1200))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(450))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(750))).toBeInTheDocument();
  });
});
