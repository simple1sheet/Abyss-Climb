import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let errorObj;
    try {
      errorObj = JSON.parse(text);
    } catch (e) {
      errorObj = { message: text };
    }

    const error = new Error(errorObj.message || `HTTP error! status: ${res.status}`);
    (error as any).status = res.status;
    (error as any).response = { data: errorObj };
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Runtime check to ensure method is a string
  if (typeof method !== 'string') {
    throw new Error(`apiRequest expects method to be a string, got ${typeof method}. Usage: apiRequest('POST', '/api/endpoint', data)`);
  }

  // Handle FormData differently - don't set Content-Type header and don't stringify
  const isFormData = data instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: isFormData ? {} : (data ? { "Content-Type": "application/json" } : {}),
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// API base URL configuration for mobile and web
export const getApiBaseUrl = () => {
  if (window.location.protocol === 'capacitor:') {
    // Running in Capacitor (mobile app)
    return 'https://rest-express-leon-mund31507.replit.app';
  }
  // Running in browser (development or web)
  return '';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});