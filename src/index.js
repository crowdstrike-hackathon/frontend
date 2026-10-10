import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0e111a",
          color: "#e6e9ef",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "13px",
        },
      }}
    />
  </React.StrictMode>
);
