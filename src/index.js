import React from "react";
import ReactDOM from "react-dom/client"; // note /client
import App from "./App";
import { SidebarProvider } from "./components/SidebarContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
  <SidebarProvider>
    <App />
  </SidebarProvider>
  </React.StrictMode>
);
