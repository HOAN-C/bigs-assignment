/**
 * 앱 엔트리포인트.

 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./shared/api";
import { BrowserRouter } from "react-router-dom";
import { ThemeModeProvider, GlobalStyle } from "./shared/styles";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeModeProvider>
          <GlobalStyle />
          <App />
        </ThemeModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
