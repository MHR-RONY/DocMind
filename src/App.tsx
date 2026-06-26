import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import Index from "./pages/Index.tsx";
import Settings from "./pages/Settings.tsx";
import Chats from "./pages/Chats.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import Conversations from "./pages/admin/Conversations.tsx";
import Analytics from "./pages/admin/Analytics.tsx";
import KnowledgeBase from "./pages/admin/KnowledgeBase.tsx";
import Documents from "./pages/admin/Documents.tsx";
import DataSources from "./pages/admin/DataSources.tsx";
import Embeddings from "./pages/admin/Embeddings.tsx";
import Users from "./pages/admin/Users.tsx";
import UploadPage from "./pages/admin/Upload.tsx";
import Integrations from "./pages/admin/Integrations.tsx";
import Labels from "./pages/admin/Labels.tsx";
import SecurityPage from "./pages/admin/Security.tsx";
import Notifications from "./pages/admin/Notifications.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import Upgrade from "./pages/Upgrade.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats"
                element={
                  <ProtectedRoute>
                    <Chats />
                  </ProtectedRoute>
                }
              />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="conversations" element={<Conversations />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="knowledge-base" element={<KnowledgeBase />} />
                <Route path="documents" element={<Documents />} />
                <Route path="data-sources" element={<DataSources />} />
                <Route path="embeddings" element={<Embeddings />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="users" element={<Users />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="labels" element={<Labels />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
