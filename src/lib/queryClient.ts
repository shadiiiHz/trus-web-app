import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Errors are surfaced by the callers (toasts, session handling); a
      // silent retry would only delay them and re-fire auth failures.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
