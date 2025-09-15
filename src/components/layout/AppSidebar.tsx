import { Link, NavLink, useLocation } from 'react-router-dom';
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
  { title: 'Uploads', url: '/upload', icon: PlusCircle }
];

const projectNavItems = [
  { title: 'New Project', url: '/projects/new', icon: PlusCircle },
  { title: 'Library', url: '/library', icon: FolderOpen },
];



export function AppSidebar() {
  const projects = useSelector((state:RootState)=>state.project.project)
  const user = useSelector((state:RootState)=>state.localStorage.user)
  const library = useSelector((state:RootState)=>state.library.library)
  const proposal = useSelector((state:RootState)=>state.proposal.proposal)
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const toolsNavItems = [
    { title: 'Proposals', url: '/proposals', icon: Users, badge: proposal.length },
    // { title: 'AI Assistant', url: '/ai-assistant', icon: Brain },
  ];
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

  const popUp = (timer: number = 500) => {
   return(
        <div className="w-fit bg-white p-4 rounded-lg shadow-lg z-20 ">
           click to sign in
        </div>
    );
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
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild className={getNavClassName(`/project/${item.id}`)}>
                    <NavLink to={`/project/${item.id}`} className="capitalize flex items-center justify-between">
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile */}
            {user ? (
              <>
              {!collapsed && (
                <SidebarFooter className="p-4 border-t border-border">
                  <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-bold">
                          {user?.user.first_name[0] + ' ' + user?.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground"> {user.user.last_name + " " + user.user.first_name} </p>
                        <p className="text-xs text-muted-foreground">HVAC Engineer</p>
                      </div>
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                  </div>
                </SidebarFooter>
              )}
              </>
            ):(
              <SidebarFooter className="p-4 relative border-t border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-bold">
                      GS
                  </AvatarFallback>
                  </Avatar>
                  <Link to="/signin" className="flex-1">
                    <p className="text-sm font-medium text-foreground">Guest User</p>
                    <p className="text-xs text-muted-foreground">Please Sign In</p>
                  </Link>
                </div>
              </SidebarFooter>
            )}
    </Sidebar>
  );
}