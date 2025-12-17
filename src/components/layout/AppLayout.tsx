import { logger } from "@/utils/logger";
import { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useDispatch } from 'react-redux';
import { loadUser } from '@/lib/redux/slice/localStorageSlice';

export function AppLayout() {
  const dispatch = useDispatch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const pages:string[] = [
    '/signup',
    '/login',
    '/reset-password',
    '/forgot-password',
    '/signin',
  ];

  const isOpenPage = pages.some(page => location.pathname.includes(page));
  const check = ({children}:{children: ReactNode})=>{
    if(!isOpenPage){
      return  children;
    }
  }

  // Load persisted Redux state on mount
  useEffect(()=>{
      dispatch(loadUser())
    },[dispatch])
  return (
    <SidebarProvider defaultOpen={!isSidebarCollapsed}>
      <div className="min-h-screen flex w-full bg-background">
          {check({children: <AppSidebar />})}
        {/* <AppSidebar /> */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {check({children: <TopBar />})}
          {/* <TopBar /> */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
