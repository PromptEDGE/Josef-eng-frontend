import { logger } from "@/utils/logger";
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  Building,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RootState } from '@/lib/redux/store';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const profile = useSelector((state: RootState) => state.settings.profile);
  const preferences = useSelector((state: RootState) => state.settings.preferences);
  const security = useSelector((state: RootState) => state.settings.security);
  const user = useSelector((state: RootState) => state.localStorage.user);

  const initials = useMemo(() => {
    const first = profile.firstName?.[0] ?? '';
    const last = profile.lastName?.[0] ?? '';
    return `${first}${last}`.trim() || 'HV';
  }, [profile.firstName, profile.lastName]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">
            View your account information and preferences at a glance.
          </p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground">
          <Link to="/settings">
            <Settings className="w-4 h-4 mr-2" />
            Manage Settings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="bg-gradient-hero text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{profile.company}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Theme</span>
                <Badge variant="secondary" className="capitalize">{preferences.theme}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language</span>
                <Badge variant="secondary" className="uppercase">{preferences.language}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span className="font-medium">{preferences.timezone}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Notifications</p>
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <StatusPill active={preferences.emailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push</span>
                  <StatusPill active={preferences.pushNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Sound</span>
                  <StatusPill active={preferences.soundNotifications} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Two-factor authentication</span>
                <StatusPill active={security.twoFactorEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session timeout</span>
                <span className="font-medium">{security.sessionTimeout} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Password last changed</span>
                <span className="font-medium">{new Date(security.passwordLastChanged).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Account</p>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.user.email ?? profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.title}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organisation Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Company</p>
                <p className="text-base font-medium text-foreground">{profile.company}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Location</p>
                <p className="text-base font-medium text-foreground">{profile.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Preferred Theme</p>
                <p className="text-base font-medium text-foreground capitalize">{preferences.theme}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Auto-save</p>
                <StatusPill active={preferences.autoSave} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

type StatusPillProps = {
  active: boolean;
};

const StatusPill = ({ active }: StatusPillProps) => (
  <Badge variant={active ? 'default' : 'outline'} className="text-xs">
    {active ? 'Enabled' : 'Disabled'}
  </Badge>
);
