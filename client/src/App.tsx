import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute, GuestRoute } from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeekerDashboard from "./pages/seeker/Dashboard";
import SeekerOnboarding from "./pages/seeker/Onboarding";
import SeekerProfile from "./pages/seeker/Profile";
import ReferrerBrowse from "./pages/referrer/Browse";
import ReferrerOnboarding from "./pages/referrer/Onboarding";
import ReferrerProfile from "./pages/referrer/Profile";
import SeekerDetail from "./pages/referrer/SeekerDetail";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppRoutes() {
  const location = useLocation();
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="gradient-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          <Route path="/seeker/onboarding" element={<ProtectedRoute role="SEEKER"><SeekerOnboarding /></ProtectedRoute>} />
          <Route path="/seeker/profile" element={<ProtectedRoute role="SEEKER"><SeekerProfile /></ProtectedRoute>} />
          <Route path="/seeker" element={<ProtectedRoute role="SEEKER"><SeekerDashboard /></ProtectedRoute>} />

          <Route path="/referrer/onboarding" element={<ProtectedRoute role="REFERRER"><ReferrerOnboarding /></ProtectedRoute>} />
          <Route path="/referrer/profile" element={<ProtectedRoute role="REFERRER"><ReferrerProfile /></ProtectedRoute>} />
          <Route path="/referrer/seekers/:id" element={<ProtectedRoute role="REFERRER"><SeekerDetail /></ProtectedRoute>} />
          <Route path="/referrer" element={<ProtectedRoute role="REFERRER"><ReferrerBrowse /></ProtectedRoute>} />

          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
