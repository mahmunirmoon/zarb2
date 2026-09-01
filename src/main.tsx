import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HelpWidget } from "./components/HelpWidget";
import { StudentCredit } from "./components/StudentCredit";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <StudentCredit />
    <HelpWidget />
  </React.StrictMode>,
);
