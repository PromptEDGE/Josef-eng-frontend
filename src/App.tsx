import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/components/Dashboard";
import DocumentsPage from "./pages/DocumentsPage";
import { FileUpload } from "@/components/FileUpload";
import { AIAssistant } from "@/components/AIAssistant";
import CalculationsPage from "./pages/CalculationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import NewProjectPage from "./pages/NewProjectPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import StandardsPage from "./pages/StandardsPage";
import LibraryPage from "./pages/LibraryPage";
import ProposalsPage from "./pages/ProposalsPage";
import NotFound from "./pages/NotFound";
import SignuPage from "./pages/SignupPage";
import SignInPage from "./pages/SignInPage";
import RoutesAuth from "./components/RoutesAuth";
import ForgotPasswordPage from "./pages/Forgot-Password";
import ProtectedRoutes from "./components/ProtectRoute";

const queryClient = new QueryClient();

const App = () => {

  return( 
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            // <ProtectedRoutes>
            <AppLayout />
            // </ProtectedRoutes>

            }>
            <Route path="/signup" element={
              <RoutesAuth>
                <SignuPage />
              </RoutesAuth>} 
              />
            <Route path="/signin" element={
              <RoutesAuth>
                <SignInPage />
              </RoutesAuth>}
              />

            <Route path="/forgot-password" element={
              <RoutesAuth>
                <ForgotPasswordPage />
              </RoutesAuth>}
              />
            <Route index element={
              <ProtectedRoutes>
              <Dashboard onViewChange={() => {
              }} />
              </ProtectedRoutes>
              } />
            <Route path="standards" element={
              <ProtectedRoutes><StandardsPage /></ProtectedRoutes>} />
            <Route path="projects/new" element={<ProtectedRoutes><NewProjectPage /></ProtectedRoutes>} />
            <Route path="library" element={<ProtectedRoutes><LibraryPage /></ProtectedRoutes>} />
            <Route path="library/videos" element={
              <ProtectedRoutes>
                <LibraryPage />
              </ProtectedRoutes>
              } />
            <Route path="library/audio" element={
              <ProtectedRoutes>
                <LibraryPage />
              </ProtectedRoutes>
              } />
            <Route path="library/documents" element={
              <ProtectedRoutes>
                <LibraryPage />
              </ProtectedRoutes>
              } />
            <Route path="proposals" element={
              <ProtectedRoutes>
                <ProposalsPage />
                </ProtectedRoutes>
                } />
            <Route path="project/:uid" element={
              <ProtectedRoutes>
                <AIAssistant />
              </ProtectedRoutes>
              } />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )
};

export default App;
