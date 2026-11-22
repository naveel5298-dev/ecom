import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { Providers } from "./common/Providers";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";


const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>

      <AuthProvider>
        <Provider store={store}>
          <Providers>

            <App />

          </Providers>
        </Provider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
