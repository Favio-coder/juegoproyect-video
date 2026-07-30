import { Suspense, useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAppLoading } from "./core/hooks/useAppLoading";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const { progress, isLoaded } = useAppLoading();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setShowApp(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  return (
    <>
      {showApp && (
        <Suspense fallback={null}>
          <RouterProvider router={router} />
        </Suspense>
      )}
      <SplashScreen progress={progress} isLoaded={isLoaded} />
    </>
  );
}
