import { createBrowserRouter } from "react-router-dom";

import MenuPage from "./features/menu/pages/MenuPage";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <MenuPage />,
    },

]);