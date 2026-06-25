import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/index.css";
import "react-datepicker/dist/react-datepicker.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const Providers = ({ children }) =>
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Providers>
  </React.StrictMode>,
);
