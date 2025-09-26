// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";   // 홈 화면(지금 보이는 화면)
import Chat from "./Chat"; // 우리가 만든 대화 화면
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/chat", element: <Chat /> },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
