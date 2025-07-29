import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calculator,
  Thermometer,
  Wind,
  Zap,
  Droplets,
  Building,
  History,
  Play,
  Save,
  Download,
  Copy,
  Settings,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Calculation {
  id: string;
  name: string;
  type: 'cooling-load' | 'heating-load' | 'duct-sizing' | 'pipe-sizing' | 'energy-analysis' | 'refrigeration';
  status: 'completed' | 'running' | 'failed' | 'draft';
  createdAt: Date;
  lastModified: Date;
  results?: {
    totalLoad?: number;
    efficiency?: number;
    cost?: number;
    [key: string]: any;
  };
  inputs?: Record<string, any>;
}

const mockCalculations: Calculation[] = [
  {
    id: '1',
    name: 'Office Building A - Cooling Load',
    type: 'cooling-load',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-15'),
    results: {
      totalLoad: 120000,
      efficiency: 3.2,
      cost: 45000,
    }
  },
  {
    id: '2',
    name: 'Data Center HVAC Sizing',
    type: 'cooling-load',
    status: 'running',
    createdAt: new Date('2024-01-14'),
    lastModified: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Restaurant Kitchen Ventilation',
    type: 'duct-sizing',
    status: 'completed',
    createdAt: new Date('2024-01-13'),
    lastModified: new Date('2024-01-13'),
    results: {
      totalLoad: 75000,
      efficiency: 2.8,
    }
  },
];

const calculationTypes = [
  {
    id: 'cooling-load',
    name: 'Cooling Load Calculation',
    description: 'Calculate cooling requirements for spaces',
    icon: Thermometer,
    color: 'text-primary'
  },
  {
    id: 'heating-load',
    name: 'Heating Load Calculation',
    description: 'Calculate heating requirements for spaces',
    icon: Zap,
    color: 'text-destructive'
  },
  {
    id: 'duct-sizing',
    name: 'Duct Sizing',
    description: 'Size ductwork for air distribution',
    icon: Wind,
    color: 'text-accent'
  },
  {
    id: 'pipe-sizing',
    name: 'Pipe Sizing',
    description: 'Size piping for water systems',
    icon: Droplets,
    color: 'text-secondary'
  },
  {
    id: 'energy-analysis',
    name: 'Energy Analysis',
    description: 'Analyze energy consumption and efficiency',
    icon: Building,
    color: 'text-success'
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration Load',
    description: 'Calculate refrigeration requirements',
    icon: Calculator,
    color: 'text-warning'
  },
];

export default function CalculationsPage() {
  const [calculations] = useState<Calculation[]>(mockCalculations);
  const [selectedType, setSelectedType] = useState<string>('cooling-load');
  const [activeTab, setActiveTab] = useState('new');

  // Form state for new calculation
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    occupancy: '',
    lighting: '',
    equipment: '',
    climate: '',
    orientation: '',
    insulation: '',
    windows: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRunCalculation = () => {
    console.log('Running calculation with data:', formData);
    // Here you would send the calculation request
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Calculation['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'running':
        return 'text-warning';
      case 'failed':
        return 'text-destructive';
      case 'draft':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Calculation['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'running':
        return Clock;
      case 'failed':
        return AlertCircle;
      case 'draft':
        return Settings;
      default:
        return Clock;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculations</h1>
          <p className="text-muted-foreground">
            Run engineering calculations and analyze results
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Plus className="w-4 h-4 mr-2" />
          New Calculation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">New Calculation</TabsTrigger>
          <TabsTrigger value="recent">Recent Calculations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          {/* Calculation Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Calculation Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calculationTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-smooth hover:shadow-elegant ${
                      selectedType === type.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center ${type.color}`}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{type.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calculation Form */}
          {selectedType === 'cooling-load' && (
            <Card>
              <CardHeader>
                <CardTitle>Cooling Load Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calc-name">Calculation Name</Label>
                    <Input
                      id="calc-name"
                      placeholder="Enter calculation name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Floor Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="5000"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupancy">Occupancy (people)</Label>
                    <Input
                      id="occupancy"
                      type="number"
                      placeholder="150"
                      value={formData.occupancy}
                      onChange={(e) => handleInputChange('occupancy', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lighting">Lighting Load (W/sq ft)</Label>
                    <Input
                      id="lighting"
                      type="number"
                      step="0.1"
                      placeholder="1.2"
                      value={formData.lighting}
                      onChange={(e) => handleInputChange('lighting', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipment Load (W/sq ft)</Label>
                    <Input
                      id="equipment"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={formData.equipment}
                      onChange={(e) => handleInputChange('equipment', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="climate">Climate Zone</Label>
                    <Select value={formData.climate} onValueChange={(value) => handleInputChange('climate', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select climate zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1a">1A - Very Hot, Humid</SelectItem>
                        <SelectItem value="2a">2A - Hot, Humid</SelectItem>
                        <SelectItem value="3a">3A - Warm, Humid</SelectItem>
                        <SelectItem value="4a">4A - Mixed, Humid</SelectItem>
                        <SelectItem value="5a">5A - Cool, Humid</SelectItem>
                        <SelectItem value="6a">6A - Cold, Humid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Building Orientation</Label>
                    <Select value={formData.orientation} onValueChange={(value) => handleInputChange('orientation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="windows">Window-to-Wall Ratio (%)</Label>
                    <Input
                      id="windows"
                      type="number"
                      placeholder="40"
                      value={formData.windows}
                      onChange={(e) => handleInputChange('windows', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional requirements or special conditions..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleRunCalculation} className="bg-gradient-primary text-primary-foreground">
                    <Play className="w-4 h-4 mr-2" />
                    Run Calculation
                  </Button>
                  <Button variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Save as Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {calculations.map((calc) => {
              const StatusIcon = getStatusIcon(calc.status);
              return (
                <Card key={calc.id} className="hover:shadow-elegant transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{calc.name}</h3>
                          <Badge variant="outline">
                            {calculationTypes.find(t => t.id === calc.type)?.name}
                          </Badge>
                          <div className={`flex items-center gap-1 ${getStatusColor(calc.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm capitalize">{calc.status}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Created: {formatDate(calc.createdAt)}</p>
                          <p>Modified: {formatDate(calc.lastModified)}</p>
                        </div>

                        {calc.results && (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {calc.results.totalLoad && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Total Load:</span>
                                <span className="ml-2 font-medium">{calc.results.totalLoad.toLocaleString()} BTU/hr</span>
                              </div>
                            )}
                            {calc.results.efficiency && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Efficiency:</span>
                                <span className="ml-2 font-medium">{calc.results.efficiency} COP</span>
                              </div>
                            )}
                            {calc.results.cost && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Est. Cost:</span>
                                <span className="ml-2 font-medium">${calc.results.cost.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="p-6 text-center">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calculation Templates</h3>
              <p className="text-muted-foreground mb-4">
                Save your frequently used calculation setups as templates for quick access.
              </p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}