import { logger } from "@/utils/logger";
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { FileUpload } from './FileUpload';
import { AIAssistant } from './AIAssistant';

export function MainLayout() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={setActiveView} />;
      case 'upload':
        return <FileUpload />;
      case 'ai-assistant':
        return <AIAssistant />;
      default:
        return <Dashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}