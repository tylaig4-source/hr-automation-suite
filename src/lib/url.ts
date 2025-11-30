/**
 * Helper para obter a base URL da aplicação
 * Usa NEXTAUTH_URL ou constrói a partir do request
 */

export function getBaseUrl(): string {
  // Em produção, usar NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Em desenvolvimento, usar localhost
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  // Fallback: tentar construir a partir do request (server-side)
  // Isso será usado apenas se NEXTAUTH_URL não estiver configurado
  return "http://localhost:3000";
}

/**
 * Helper para obter a base URL no cliente
 */
export function getBaseUrlClient(): string {
  if (typeof window !== "undefined") {
    // No cliente, usar a URL atual
    return window.location.origin;
  }

  // Fallback para server-side
  return getBaseUrl();
}

/**
 * Helper para construir URLs completas
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrlClient();
  // Garantir que path comece com /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

