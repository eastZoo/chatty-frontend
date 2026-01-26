import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: true,
      staleTime: 0,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
