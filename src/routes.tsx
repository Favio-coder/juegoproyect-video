/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const MenuPage = lazy(() => import("./features/menu/pages/MenuPage"));
const GameplayPage = lazy(() => import("./features/gameplay/pages/GameplayPage"))
const PruebaPage = lazy(() => import("./features/gameplay/pages/PruebaPage"))
const SupabaseTestPage = lazy(() => import("./features/supabase/pages/SupabaseTestPage"))
const RankingPage = lazy(() => import("./features/ranking/pages/RankingPage"))
const RewardPage = lazy(() => import("./features/reward/pages/RewardPage"))
const NotFoundPage = lazy(() => import("./features/notfound/pages/NotFoundPage"))
const DemoPage = lazy(() => import("./features/demo3d/pages/DemoPage"))
const PuppetLabPage = lazy(() => import("./features/avatar/pages/PuppetLabPage"))

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
    path: "/avatar-puppet",
    element: <PuppetLabPage />,
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
    path: "/pruebas",
    element: <SupabaseTestPage />,
  },
  {
    path: "/ranking",
    element: <RankingPage />,
  },
  {
    path: "/recompensa",
    element: <RewardPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
