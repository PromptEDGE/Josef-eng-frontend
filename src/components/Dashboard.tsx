import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  Brain, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calculator,
  Users,
  Database,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import heroImage from '@/assets/engineering-hero.jpg';
import { useEffect, useState } from 'react';
import { ActivityItem } from '@/utils/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const stats = [
  {
    id: 'documents',
    label: 'Documents Processed',
    value: '247',
    change: '+12',
    icon: FileText,
    color: 'text-primary'
  },
  {
    id: 'projects',
    label: 'Active Projects',
    value: '8',
    change: '+2',
    icon: Target,
    color: 'text-accent'
  },
  // {
  //   id: 'calculations',
  //   label: 'Calculations Done',
  //   value: '156',
  //   change: '+24',
  //   icon: Calculator,
  //   color: 'text-success'
  // },
  // {
  //   id: 'efficiency',
  //   label: 'Time Saved (Hours)',
  //   value: '342',
  //   change: '+67',
  //   icon: Clock,
  //   color: 'text-warning'
  // }
];

// const recentActivity = [
//   {
//     id: 1,
//     type: 'document',
//     title: 'ASHRAE 90.1 Standard uploaded',
//     time: '2 hours ago',
//     status: 'completed',
//     icon: FileText
//   },
//   {
//     id: 2,
//     type: 'calculation',
//     title: 'Cooling load calculation for Office Building A',
//     time: '4 hours ago',
//     status: 'completed',
//     icon: Calculator
//   },
//   {
//     id: 3,
//     type: 'proposal',
//     title: 'Chiller system proposal generated',
//     time: '6 hours ago',
//     status: 'pending',
//     icon: Users
//   },
//   {
//     id: 4,
//     type: 'analysis',
//     title: 'Energy efficiency analysis completed',
//     time: '1 day ago',
//     status: 'completed',
//     icon: TrendingUp
//   }
// ];

const quickActions = [
  {
    id: 'upload',
    title: 'Upload Documents',
    description: 'Add new technical documents, drawings, or specifications',
    icon: Upload,
    color: 'bg-primary',
    action: 'upload'
  },
  // {
  //   id: 'calculate',
  //   title: 'Run Calculations',
  //   description: 'Perform load calculations, sizing, or energy analysis',
  //   icon: Calculator,
  //   color: 'bg-accent',
  //   action: 'calculations'
  // },
  // {
  //   id: 'ai-chat',
  //   title: 'Ask AI Assistant',
  //   description: 'Get instant answers to technical questions',
  //   icon: Brain,
  //   color: 'bg-success',
  //   action: 'ai-assistant'
  // },
  {
    id: 'generate',
    title: 'Generate Proposal',
    description: 'Create proposals with pricing and layouts',
    icon: Users,
    color: 'bg-warning',
    action: 'proposals'
  }
];

const systemHealth = [
  { label: 'Knowledge Base', status: 'Healthy', progress: 98 },
  { label: 'AI Processing', status: 'Optimal', progress: 95 },
  { label: 'Document Analysis', status: 'Active', progress: 87 },
  { label: 'Standards Database', status: 'Updated', progress: 100 }
];

export function Dashboard({ onViewChange }: DashboardProps) {
  const activites = useSelector((state:RootState)=>state.activites.activities)
  const [recentActivity,setRecentActivity] = useState<ActivityItem[]>([])
  useEffect(()=>{
    setRecentActivity(activites)
  },[activites])
  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <Card className="relative overflow-hidden bg-gradient-hero text-primary-foreground p-6">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Your AI Engineering Assistant</h1>
              <p className="text-primary-foreground/80 text-lg">
                Advanced HVAC & Refrigeration Intelligence at Your Fingertips
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => onViewChange('/projects/new')}
                className="shadow-elegant"
              >
                <Brain className="w-4 h-4 mr-2" />
                Start AI Chat
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onViewChange('/upload-file')}
                className="border-primary-foreground/10 text-black hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-6 hover:shadow-elegant transition-all duration-300 transform transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.id} 
                className="p-6 cursor-pointer hover:shadow-elegant transition-smooth group"
                onClick={() => onViewChange(action.action)}
              >
                <div className="flex items-start gap-4 transition-all duration-300 transform ">
                  <div className={`w-12 h-12 ${action.color} transition-all duration-300 transform rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-smooth`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="transition-all duration-300 transform font-semibold text-foreground group-hover:text-primary transition-smooth">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">System Health</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{system.label}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        system.progress > 95 ? 'text-success' : 
                        system.progress > 85 ? 'text-warning' : 'text-destructive'
                      }`}
                    >
                      {system.status}
                    </Badge>
                  </div>
                  <Progress value={system.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <Card className="p-6">
            {recentActivity.length===0&&
              <div className="capitalize flex items-center justify-center w-full ">
                no activities
              </div>
            }
            {recentActivity.length>0&&
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-smooth">
                    <div className="w-10 h-10 bg-gradient-card rounded-lg flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(activity.time).toLocaleString()}</p>
                    </div>
                    {/* {activity.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )} */}
                  </div>
                ))}
              </div>
            }
          </Card>
        </div>

        {/* AI Insights */}
        {/* <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">AI Insights</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Efficiency Opportunity</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider variable speed drives for chillers in Project Alpha - potential 15% energy savings.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Standards Update</h4>
                  <p className="text-sm text-muted-foreground">
                    New ASHRAE 62.1 requirements may affect ventilation calculations in your current projects.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">
                    47 new technical documents have been processed and added to your knowledge base.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}