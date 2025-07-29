import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  BookOpen,
  Users,
  Brain,
  PlusCircle,
  FolderOpen,
  Video,
  Mic,
  FileText,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Standards', url: '/standards', icon: BookOpen },
];

const projectNavItems = [
  { title: 'New Project', url: '/projects/new', icon: PlusCircle },
  { title: 'Library', url: '/library', icon: FolderOpen },
];


const toolsNavItems = [
  { title: 'Proposals', url: '/proposals', icon: Users, badge: '3' },
  // { title: 'AI Assistant', url: '/ai-assistant', icon: Brain },
];

export function AppSidebar() {
  const projects = useSelector((state:RootState)=>state.project.project)
  const library = useSelector((state:RootState)=>state.library.library)
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const libraryItems = [
    { title: 'Videos', url: '/library/videos', icon: Video, badge: library.filter((item)=>item.type==="video").length },
    { title: 'Audio Files', url: '/library/audio', icon: Mic, badge: library.filter((item)=>item.type==="audio").length },
    { title: 'Documents', url: '/library/documents', icon: FileText, badge: library.filter((item)=>item.type==="document").length },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? 'bg-primary text-primary-foreground font-medium shadow-elegant'
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="p-4">
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
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className={collapsed ? 'w-4 h-4' : 'w-4 h-4 mr-3'} />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className={collapsed ? 'w-4 h-4' : 'w-4 h-4 mr-3'} />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Library - Show when on library routes */}
        {!collapsed && location.pathname.startsWith('/library') && (
          <SidebarGroup>
            <SidebarGroupLabel>Library Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {libraryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={getNavClassName(item.url)} size="sm">
                      <NavLink to={item.url} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <item.icon className="w-3 h-3 mr-2" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                    <NavLink to={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className={collapsed ? 'w-4 h-4' : 'w-4 h-4 mr-3'} />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && 'badge' in item && item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects History</SidebarGroupLabel>
          <SidebarMenu>
              {projects.map((item) => (
                <SidebarMenuItem key={item.uid}>
                  <SidebarMenuButton asChild className={getNavClassName(`/project/${item.uid}`)}>
                    <NavLink to={`/project/${item.uid}`} className="capitalize flex items-center justify-between">
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile */}
      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">HVAC Engineer</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full"></div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}