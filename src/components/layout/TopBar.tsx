import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearTokens } from '@/utils/authTokens';
import { clearUser as clearStoredUser } from '@/lib/redux/slice/localStorageSlice';
import { clearUser as clearUserDetails } from '@/lib/redux/slice/userSlice';
import { clearPersistedState } from '@/lib/redux/persistState';
import { getInitials } from '@/utils/getInitials';


export function TopBar() {
  const activities = useSelector((state:RootState)=>state.activites.activities)
  const user = useSelector((state:RootState)=>state.localStorage.user)
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };
  const handleLogout = () => {
    // Clear tokens and user data, redirect to signin
    clearTokens();
    localStorage.removeItem('auth');
    // Reset slices
    dispatch(clearStoredUser());
    dispatch(clearUserDetails());
    clearPersistedState();
    window.location.href = '/signin';
  };
  return (
    <header className="h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 flex items-center justify-between gap-4">
      <SidebarTrigger className="h-8 w-8" />
      
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, projects, calculations..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 h-8 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Help */}
        {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="w-4 h-4" />
        </Button> */}

        {/* Notifications */}
       {user&& <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center">
                {activities.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="text-sm font-medium">Calculation completed</div>
              <div className="text-xs text-muted-foreground">
                Cooling load analysis for Office Building A is ready
              </div>
              <div className="text-xs text-muted-foreground">2 minutes ago</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="text-sm font-medium">New standard update</div>
              <div className="text-xs text-muted-foreground">
                ASHRAE 90.1-2022 requirements have been added
              </div>
              <div className="text-xs text-muted-foreground">1 hour ago</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="text-sm font-medium">Document processed</div>
              <div className="text-xs text-muted-foreground">
                5 new technical documents added to knowledge base
              </div>
              <div className="text-xs text-muted-foreground">3 hours ago</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>}

        {/* User Menu */}
        {user?<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-bold">
                  {getInitials(user.user)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() =>navigate('/profile')} >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() =>navigate('/settings')}>
              <Settings  className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>:
        <NavLink to={"/signin"} >
          <Button variant="secondary" className='h-8 bg-gradient-to-r from-blue-400 to-blue-600 text-white ' >
            sign in
          </Button>
        </NavLink>
        }
      </div>
    </header>
  );
}
