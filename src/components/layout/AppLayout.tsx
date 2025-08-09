import { ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/project';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { getAllProject } from '@/lib/redux/slice/projectSlice';
import { loadUser } from '@/lib/redux/slice/localStorageSlice';

export function AppLayout() {
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

  const { data } = useQuery({
    queryKey: ['projects',user?.access_token],
    queryFn: ({queryKey}) => getProjects(queryKey[1]),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
  useEffect(() => {
    if (data) {
      dispatch(getAllProject(data))
    }
  }, [data,dispatch])
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