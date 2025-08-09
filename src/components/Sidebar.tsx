import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Search, 
  Brain, 
  Settings, 
  Database,
  Calculator,
  Users,
  TrendingUp,
  BookOpen,
  Video,
  Mic,
  HardDrive,
  PlusCircle,
  ChevronRight,
  Home
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/project';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'documents', label: 'Documents', icon: FileText, badge: '247' },
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'voice-notes', label: 'Voice Notes', icon: Mic, badge: '12' },
  { id: 'videos', label: 'Site Videos', icon: Video, badge: '8' },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'standards', label: 'Standards', icon: BookOpen },
  { id: 'calculations', label: 'Calculations', icon: Calculator },
  { id: 'proposals', label: 'Proposals', icon: Users, badge: '3' },
  { id: 'projects', label: 'Past Projects', icon: HardDrive },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const quickActions = [
  { id: 'new-project', label: 'New Project', icon: PlusCircle },
  { id: 'quick-calc', label: 'Quick Calculation', icon: Calculator },
  { id: 'search-docs', label: 'Search Documents', icon: Search }
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col bg-gradient-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-foreground">HVAC AI</h2>
              <p className="text-xs text-muted-foreground">Engineering Assistant</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            onClick={() => setCollapsed(true)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-2 h-6 w-6 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {collapsed && (
          <Button
            onClick={() => setCollapsed(false)}
            variant="ghost"
            size="sm"
            className="mt-2 w-full h-8"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs hover:bg-primary/10"
                  onClick={() => onViewChange(action.id)}
                >
                  <action.icon className="w-3 h-3 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="p-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Navigation
            </h3>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start h-10 transition-smooth",
                  activeView === item.id 
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant" 
                    : "hover:bg-primary/10",
                  collapsed && "px-2"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className={cn("w-4 h-4", !collapsed && "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Status */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">HVAC Engineer</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}