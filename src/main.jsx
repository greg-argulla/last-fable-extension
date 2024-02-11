import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Show from "./Show.jsx";
import Dialog from "./Dialog.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/show",
    element: <Show />,
  },
  {
    path: "/dialog",
    element: <Dialog />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div style={{ overflow: "hidden" }}>
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);
