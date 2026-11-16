import { Registrar } from "@/Interface/IPO";
import { Page } from "@/Interface/Page";

/**
 * Normalises the registrar list response into the paged shape the table uses.
 * Accepts the Spring page ({ content, totalPages, ... }), a wrapped page
 * ({ data: { content } } or { data: [...] }) or a plain array.
 */
export const toRegistrarPage = (raw: unknown): Page<Registrar> => {
  const body = raw as { data?: unknown } | null | undefined;
  const source =
    body && typeof body === "object" && "data" in body && body.data
      ? body.data
      : raw;

  if (Array.isArray(source)) {
    return {
      content: source as Registrar[],
      totalPages: source.length ? 1 : 0,
      totalElements: source.length,
      lastPage: true,
    };
  }

  const page = (source ?? {}) as Page<Registrar>;
  const content = Array.isArray(page.content) ? page.content : [];

  return {
    content,
    totalPages: page.totalPages ?? (content.length ? 1 : 0),
    totalElements: page.totalElements ?? content.length,
    lastPage: page.lastPage ?? true,
  };
};
