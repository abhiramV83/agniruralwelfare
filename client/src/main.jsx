import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { SuccessPopupProvider } from "./success-popup-context";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MotionConfig reducedMotion="user">
      <SuccessPopupProvider>
        <App />
      </SuccessPopupProvider>
    </MotionConfig>
  </BrowserRouter>,
);
