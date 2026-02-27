import axios from "axios";
import type { ApiErrorResponse } from "../types/api";

function getApiPayload(error: unknown): ApiErrorResponse | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }
  return error.response?.data as ApiErrorResponse | undefined;
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Não foi possível concluir a ação.";
  }

  if (!error.response) {
    return "Falha de conexão com a API. Verifique a URL e sua rede.";
  }

  const payload = getApiPayload(error);
  const message = payload?.message ?? error.message;

  if (message === "Invalid or expired token.") {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (payload?.fieldErrors && payload.fieldErrors.length > 0) {
    return payload.fieldErrors[0].message;
  }

  if (error.response.status >= 500) {
    return "O servidor está indisponível no momento. Tente novamente em instantes.";
  }

  if (message) {
    return message;
  }

  return "Ocorreu um erro inesperado.";
}

export function mapFieldErrors(error: unknown): Record<string, string> {
  const payload = getApiPayload(error);
  if (!payload?.fieldErrors) {
    return {};
  }

  return payload.fieldErrors.reduce<Record<string, string>>((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
}

