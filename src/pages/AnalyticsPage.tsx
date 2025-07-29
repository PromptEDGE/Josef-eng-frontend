import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  FileText,
  Calculator,
  Zap,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const performanceData = [
  { month: 'Jan', projects: 12, calculations: 156, documents: 89, efficiency: 92 },
  { month: 'Feb', projects: 15, calculations: 203, documents: 124, efficiency: 94 },
  { month: 'Mar', projects: 18, calculations: 187, documents: 145, efficiency: 89 },
  { month: 'Apr', projects: 22, calculations: 234, documents: 167, efficiency: 96 },
  { month: 'May', projects: 19, calculations: 198, documents: 134, efficiency: 91 },
  { month: 'Jun', projects: 25, calculations: 267, documents: 189, efficiency: 95 },
];

const projectStatusData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 32, color: '#3b82f6' },
  { name: 'Planning', value: 18, color: '#f59e0b' },
  { name: 'On Hold', value: 5, color: '#ef4444' },
];

const systemTypeData = [
  { type: 'HVAC', count: 145, percentage: 42 },
  { type: 'Refrigeration', count: 89, percentage: 26 },
  { type: 'Energy Systems', count: 67, percentage: 19 },
  { type: 'Controls', count: 45, percentage: 13 },
];

const efficiencyTrends = [
  { month: 'Jan', energy: 85, cost: 78, time: 92 },
  { month: 'Feb', energy: 87, cost: 82, time: 94 },
  { month: 'Mar', energy: 89, cost: 79, time: 89 },
  { month: 'Apr', energy: 91, cost: 85, time: 96 },
  { month: 'May', energy: 88, cost: 81, time: 91 },
  { month: 'Jun', energy: 93, cost: 87, time: 95 },
];

export default function AnalyticsPage() {
  const kpis = [
    {
      title: 'Total Projects',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Target,
      color: 'text-primary'
    },
    {
      title: 'Calculations Run',
      value: '1,542',
      change: '+18%',
      trend: 'up',
      icon: Calculator,
      color: 'text-accent'
    },
    {
      title: 'Documents Processed',
      value: '3,892',
      change: '+8%',
      trend: 'up',
      icon: FileText,
      color: 'text-success'
    },
    {
      title: 'Avg. Efficiency',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Zap,
      color: 'text-warning'
    },
    {
      title: 'Cost Savings',
      value: '$2.1M',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-destructive'
    },
    {
      title: 'Time Saved',
      value: '1,240h',
      change: '+22%',
      trend: 'up',
      icon: Clock,
      color: 'text-secondary'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Track performance metrics and system insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-elegant transition-smooth">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-xs ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-card flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="systems">Systems</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="projects" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="calculations" 
                      stackId="1"
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent))" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {projectStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Calculations Completed</span>
                  </div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Active Projects</span>
                  </div>
                  <p className="text-2xl font-bold">32</p>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Team Utilization</span>
                  </div>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-muted-foreground">Average this month</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Issues Resolved</span>
                  </div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={efficiencyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Energy Efficiency"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Cost Efficiency"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Time Efficiency"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Type Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemTypeData.map((system, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{system.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{system.count} projects</span>
                        <Badge variant="outline">{system.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={system.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}