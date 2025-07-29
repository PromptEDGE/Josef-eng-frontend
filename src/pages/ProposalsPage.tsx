import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Send,
  Calendar,
  DollarSign,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  client: string;
  projectType: string;
  value: number;
  status: 'draft' | 'sent' | 'under-review' | 'accepted' | 'rejected';
  createdAt: Date;
  dueDate: Date;
  lastModified: Date;
  description: string;
  assignedTo: string[];
  priority: 'high' | 'medium' | 'low';
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Commercial Office HVAC Upgrade',
    client: 'Tech Corp Inc.',
    projectType: 'Retrofit',
    value: 150000,
    status: 'under-review',
    createdAt: new Date('2024-01-10'),
    dueDate: new Date('2024-02-15'),
    lastModified: new Date('2024-01-18'),
    description: 'Complete HVAC system upgrade for 50,000 sq ft office building',
    assignedTo: ['John Doe', 'Sarah Wilson'],
    priority: 'high'
  },
  {
    id: '2',
    title: 'Hospital Critical Systems Installation',
    client: 'City Medical Center',
    projectType: 'New Installation',
    value: 500000,
    status: 'sent',
    createdAt: new Date('2024-01-05'),
    dueDate: new Date('2024-02-01'),
    lastModified: new Date('2024-01-15'),
    description: 'Installation of critical HVAC systems for new medical facility',
    assignedTo: ['Mike Johnson', 'David Lee'],
    priority: 'high'
  },
  {
    id: '3',
    title: 'School District HVAC Maintenance',
    client: 'Metro School District',
    projectType: 'Maintenance Contract',
    value: 75000,
    status: 'accepted',
    createdAt: new Date('2023-12-20'),
    dueDate: new Date('2024-01-31'),
    lastModified: new Date('2024-01-12'),
    description: 'Annual maintenance contract for 12 school buildings',
    assignedTo: ['Emma Davis', 'Tom Anderson'],
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Manufacturing Plant HVAC Design',
    client: 'Industrial Solutions LLC',
    projectType: 'Design Build',
    value: 300000,
    status: 'draft',
    createdAt: new Date('2024-01-15'),
    dueDate: new Date('2024-03-01'),
    lastModified: new Date('2024-01-20'),
    description: 'Complete HVAC design and installation for new manufacturing facility',
    assignedTo: ['John Doe', 'Bob Chen'],
    priority: 'medium'
  }
];

export default function ProposalsPage() {
  const [proposals] = useState<Proposal[]>(mockProposals);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('active');

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && ['draft', 'sent', 'under-review'].includes(proposal.status)) ||
                      (activeTab === 'completed' && ['accepted', 'rejected'].includes(proposal.status));
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'under-review': return AlertCircle;
      case 'sent': return Send;
      default: return Edit;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'under-review': return 'bg-warning/10 text-warning';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Proposals</h1>
            <p className="text-muted-foreground">
              Create, manage, and track your project proposals and bids.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search proposals by title, client, or project type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredProposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProposals.map((proposal) => {
                const StatusIcon = getStatusIcon(proposal.status);
                const daysUntilDue = getDaysUntilDue(proposal.dueDate);
                
                return (
                  <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{proposal.title}</CardTitle>
                            <Badge className={getPriorityColor(proposal.priority)}>
                              {proposal.priority}
                            </Badge>
                          </div>
                          <CardDescription className="font-medium">
                            {proposal.client}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {proposal.projectType}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(proposal.value)}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(proposal.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {proposal.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {proposal.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{proposal.assignedTo.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Due in {daysUntilDue} days</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {proposal.status === 'draft' && (
                          <Button size="sm" className="flex-1">
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No proposals found</p>
                  <p className="text-sm">Create a new proposal or adjust your search criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}