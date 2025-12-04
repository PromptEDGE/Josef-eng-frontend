import { logger } from "@/utils/logger";
import { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { getUser } from '@/api/auth';
import { loadUser } from '@/lib/redux/slice/localStorageSlice';
import useProjects from '@/hooks/useProjects';
import { getUser as setUserDetails } from '@/lib/redux/slice/userSlice';

export function AppLayout() {
  const { projects } = useProjects()
  const user = useSelector((state:RootState)=>state.localStorage.user)
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


  const {mutate } = useMutation({
    mutationFn: (id:string)=>getUser(id),
    onSuccess: (data) => {
      if (data) {
        dispatch(setUserDetails(data));
      }
    }
  })
  useEffect(() => {
    if(!user?.access_token) {
      return
    }else{
      mutate(user?.access_token)
    }

  }, [projects,dispatch,mutate,user])
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
