import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  BookOpen, 
  FileText, 
  Calendar,
  Building,
  Thermometer,
  Wind,
  Zap
} from 'lucide-react';

interface Standard {
  id: string;
  code: string;
  title: string;
  organization: string;
  category: string;
  lastUpdated: Date;
  description: string;
  status: 'current' | 'updated' | 'deprecated';
  downloadUrl?: string;
}

const mockStandards: Standard[] = [
  {
    id: '1',
    code: 'ASHRAE 90.1',
    title: 'Energy Standard for Buildings Except Low-Rise Residential Buildings',
    organization: 'ASHRAE',
    category: 'Energy Efficiency',
    lastUpdated: new Date('2024-01-15'),
    description: 'Provides minimum energy efficiency requirements for buildings and their systems.',
    status: 'current'
  },
  {
    id: '2',
    code: 'ASHRAE 62.1',
    title: 'Ventilation for Acceptable Indoor Air Quality',
    organization: 'ASHRAE',
    category: 'Indoor Air Quality',
    lastUpdated: new Date('2023-12-10'),
    description: 'Specifies minimum ventilation rates and indoor air quality procedures.',
    status: 'current'
  },
  {
    id: '3',
    code: 'ASHRAE 55',
    title: 'Thermal Environmental Conditions for Human Occupancy',
    organization: 'ASHRAE',
    category: 'Thermal Comfort',
    lastUpdated: new Date('2024-02-01'),
    description: 'Defines conditions for acceptable thermal environments.',
    status: 'updated'
  },
  {
    id: '4',
    code: 'NFPA 70',
    title: 'National Electrical Code',
    organization: 'NFPA',
    category: 'Electrical Safety',
    lastUpdated: new Date('2023-11-20'),
    description: 'Standard for electrical installation in the United States.',
    status: 'current'
  },
  {
    id: '5',
    code: 'IMC 2021',
    title: 'International Mechanical Code',
    organization: 'ICC',
    category: 'Mechanical Systems',
    lastUpdated: new Date('2023-10-15'),
    description: 'Regulations for mechanical systems including HVAC.',
    status: 'current'
  }
];

const categories = [
  { id: 'all', name: 'All Categories', icon: BookOpen },
  { id: 'Energy Efficiency', name: 'Energy Efficiency', icon: Zap },
  { id: 'Indoor Air Quality', name: 'Indoor Air Quality', icon: Wind },
  { id: 'Thermal Comfort', name: 'Thermal Comfort', icon: Thermometer },
  { id: 'Electrical Safety', name: 'Electrical Safety', icon: Zap },
  { id: 'Mechanical Systems', name: 'Mechanical Systems', icon: Building }
];

export default function StandardsPage() {
  const [standards] = useState<Standard[]>(mockStandards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');

  const filteredStandards = standards.filter(standard => {
    const matchesSearch = standard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         standard.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         standard.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || standard.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-success/10 text-success';
      case 'updated': return 'bg-warning/10 text-warning';
      case 'deprecated': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryItem = categories.find(cat => cat.name === category);
    return categoryItem?.icon || BookOpen;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Engineering Standards</h1>
          <p className="text-muted-foreground">
            Access and manage industry standards, codes, and regulations for HVAC engineering.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search standards by title, code, or organization..."
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
          <TabsTrigger value="browse">Browse Standards</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Standards List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filteredStandards.map((standard) => {
                  const CategoryIcon = getCategoryIcon(standard.category);
                  return (
                    <Card key={standard.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <CategoryIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{standard.code}</CardTitle>
                                <Badge className={getStatusColor(standard.status)}>
                                  {standard.status}
                                </Badge>
                              </div>
                              <CardDescription className="font-medium">
                                {standard.title}
                              </CardDescription>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{standard.organization}</span>
                                <span>•</span>
                                <span>{standard.category}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Updated {standard.lastUpdated.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{standard.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed Standards</CardTitle>
              <CardDescription>
                Standards you've accessed in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recently viewed standards yet</p>
                <p className="text-sm">Browse standards to see your viewing history here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Standards</CardTitle>
              <CardDescription>
                Standards you've bookmarked for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No favorite standards yet</p>
                <p className="text-sm">Add standards to favorites while browsing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}