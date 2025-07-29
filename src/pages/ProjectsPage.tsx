import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  Star,
  Thermometer,
  Wind,
  Zap,
  FileText,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  type: 'commercial' | 'industrial' | 'residential' | 'institutional';
  status: 'planning' | 'design' | 'construction' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  budget: number;
  location: string;
  description: string;
  systems: string[];
  team: string[];
  progress: number;
  lastActivity: Date;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Corporate Headquarters HVAC Renovation',
    client: 'Tech Corp Inc.',
    type: 'commercial',
    status: 'design',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    budget: 850000,
    location: 'New York, NY',
    description: 'Complete HVAC system renovation for 20-story office building',
    systems: ['VAV System', 'Chilled Water', 'Energy Recovery', 'BMS'],
    team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    progress: 65,
    lastActivity: new Date('2024-01-14')
  },
  {
    id: '2',
    name: 'Manufacturing Plant Cooling System',
    client: 'Industrial Solutions LLC',
    type: 'industrial',
    status: 'construction',
    priority: 'medium',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2024-03-15'),
    budget: 1200000,
    location: 'Chicago, IL',
    description: 'Industrial cooling system for manufacturing facility',
    systems: ['Process Cooling', 'Compressed Air', 'Exhaust Ventilation'],
    team: ['Sarah Wilson', 'Bob Chen', 'Alice Brown'],
    progress: 80,
    lastActivity: new Date('2024-01-13')
  },
  {
    id: '3',
    name: 'Hospital HVAC Upgrade',
    client: 'City Medical Center',
    type: 'institutional',
    status: 'planning',
    priority: 'urgent',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    budget: 2100000,
    location: 'Boston, MA',
    description: 'Critical HVAC upgrades for patient care areas',
    systems: ['Medical Air', 'Isolation Rooms', 'OR Ventilation', 'Clean Rooms'],
    team: ['David Lee', 'Emma Davis', 'Tom Anderson'],
    progress: 15,
    lastActivity: new Date('2024-01-15')
  },
];

export default function ProjectsPage() {
  const [projects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-secondary text-secondary-foreground';
      case 'design': return 'bg-primary text-primary-foreground';
      case 'construction': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'on-hold': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'border-muted';
      case 'medium': return 'border-warning';
      case 'high': return 'border-accent';
      case 'urgent': return 'border-destructive';
      default: return 'border-muted';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSystemIcon = (system: string) => {
    if (system.toLowerCase().includes('vav') || system.toLowerCase().includes('air')) return Wind;
    if (system.toLowerCase().includes('chilled') || system.toLowerCase().includes('cooling')) return Thermometer;
    if (system.toLowerCase().includes('energy') || system.toLowerCase().includes('electrical')) return Zap;
    return FileText;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage your HVAC engineering projects
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <Building className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => ['planning', 'design', 'construction'].includes(p.status)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, clients, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className={`hover:shadow-elegant transition-smooth border-l-4 ${getPriorityColor(project.priority)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <div className="flex items-center gap-1">
                  {project.priority === 'high' && <Star className="w-4 h-4 text-accent" />}
                  {project.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {project.type}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{project.team.length} team members</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Systems */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Systems</p>
                <div className="flex flex-wrap gap-1">
                  {project.systems.slice(0, 3).map((system, index) => {
                    const SystemIcon = getSystemIcon(system);
                    return (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <SystemIcon className="w-3 h-3 mr-1" />
                        {system}
                      </Badge>
                    );
                  })}
                  {project.systems.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.systems.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              No projects match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}