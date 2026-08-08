/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const MenuPage = lazy(() => import("./features/menu/pages/MenuPage"));
const GameplayPage = lazy(() => import("./features/gameplay/pages/GameplayPage"))
const PhoneCameraPage = lazy(() => import("./features/qr/pages/PhoneCameraPage"))
const PruebaPage = lazy(() => import("./features/gameplay/pages/PruebaPage"))
const DemoPage = lazy(() => import("./features/demo3d/pages/DemoPage"))

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MenuPage />,
  },
  {
    path: "/demo3d",
    element: <DemoPage />,
  },
  {
    path: "/juego",
    element: <GameplayPage />,
  },
  {
    path: "/prueba",
    element: <PruebaPage />,
  },
  {
    path: "/connect/:sessionId",
    element: <PhoneCameraPage />,
  },
]);
