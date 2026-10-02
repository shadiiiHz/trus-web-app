
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
