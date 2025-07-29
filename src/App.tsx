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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard onViewChange={() => {}} />} />
            <Route path="standards" element={<StandardsPage />} />
            <Route path="projects/new" element={<NewProjectPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/videos" element={<LibraryPage />} />
            <Route path="library/audio" element={<LibraryPage />} />
            <Route path="library/documents" element={<LibraryPage />} />
            <Route path="proposals" element={<ProposalsPage />} />
            <Route path="project/:uid" element={<AIAssistant />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
