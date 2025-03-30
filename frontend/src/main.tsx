import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router";
import { ViemContextProvider } from "./contexts/viem-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ViemContextProvider>
      <RouterProvider router={router} />
    </ViemContextProvider>
  </StrictMode>,
);
