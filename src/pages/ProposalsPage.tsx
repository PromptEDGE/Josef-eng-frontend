import { useEffect, useState } from 'react';
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
import { Proposal } from '@/utils/types';
import { handleDownload } from '@/utils/handleDownload';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';



const mockProposals: Proposal[] = [
  {
    id: '1',
    project_uid: 'p1',
    projectName: 'Commercial Office HVAC Upgrade',
    client: 'Tech Corp Inc.',
    projectType: 'commercial',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-01'),
    budget: '$150,000',
    location: 'New York',
    description: 'Complete HVAC system upgrade for 50,000 sq ft office building',
    systems: ['HVAC', 'Electrical'],
    createdAt: '2024-01-10',
    conversation: '',
    pdf: undefined
  },
  {
    id: '2',
    project_uid: 'p2',
    projectName: 'Hospital Critical Systems Installation',
    client: 'City Medical Center',
    projectType: 'institutional',
    priority: 'high',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-01'),
    budget: '$500,000',
    location: 'Los Angeles',
    description: 'Installation of critical HVAC systems for new medical facility',
    systems: ['HVAC', 'Plumbing'],
    createdAt: '2024-01-05',
    conversation: '',
    pdf: undefined
  },
  {
    id: '3',
    project_uid: 'p3',
    projectName: 'School District HVAC Maintenance',
    client: 'Metro School District',
    projectType: 'institutional',
    priority: 'medium',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2024-12-01'),
    budget: '$75,000',
    location: 'Chicago',
    description: 'Annual maintenance contract for 12 school buildings',
    systems: ['HVAC'],
    createdAt: '2023-12-20',
    conversation: '',
    pdf: undefined
  },
  {
    id: '4',
    project_uid: 'p4',
    projectName: 'Manufacturing Plant HVAC Design',
    client: 'Industrial Solutions LLC',
    projectType: 'industrial',
    priority: 'medium',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-09-01'),
    budget: '$300,000',
    location: 'Houston',
    description: 'Complete HVAC design and installation for new manufacturing facility',
    systems: ['HVAC', 'Design'],
    createdAt: '2024-01-15',
    conversation: '',
    pdf: undefined
  }
];

export default function ProposalsPage() {
  const [proposals,setProposals] = useState<Proposal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<string>('');
  const [activeTab, setActiveTab] = useState('active');
  const stateProposals = useSelector((state:RootState)=>state.proposal.proposal)
  // const proposals = proposals.filter(proposal => {
  //   const matchesSearch = proposal.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||proposal.client.toLowerCase().includes(searchQuery.toLowerCase()) ||proposal.projectType.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesStatus = statusFilter === 'all';
  //   const matchesTab = activeTab === 'all' || activeTab === 'active' || activeTab === 'completed';
  //   return matchesSearch && matchesStatus && matchesTab;
  // });
  useEffect(()=>{
    setProposals(stateProposals)
  },[stateProposals])

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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
        </TabsList> */}

        <TabsContent value={activeTab} className="space-y-6">
          {proposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {proposals.map((proposal) => {
                return (
                  <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{proposal.projectName}</CardTitle>
                            <Badge className="bg-muted text-muted-foreground">
                              {proposal.priority}
                            </Badge>
                          </div>
                          <CardDescription className="font-medium">
                            {proposal.client}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {proposal.projectType}
                            </div>
                            <div className="flex items-center gap-1">
                              {proposal.budget}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {proposal.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {proposal.location}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {proposal.startDate?.toLocaleDateString()} - {proposal.endDate?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button onClick={()=>window.open(proposal.pdf.url, "_blank")} variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() =>handleDownload(String(proposal.pdf.url),proposal.pdf.name)}>
                          
                          Download
                        </Button>
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
