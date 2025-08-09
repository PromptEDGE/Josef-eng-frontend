import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Building,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  MapPin,
  FileText,
  Plus,
  Save,
  ArrowLeft,
  CheckCircle,
  Wind,
  Thermometer,
  Zap,
  Droplets,
  X,
  FolderCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActivityItem, CreateProjectType, ProjectData } from '@/utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { createNew } from '@/lib/redux/slice/projectSlice';
import { addActivity } from '@/lib/redux/slice/activitySlice';
import { createProject } from '@/api/project';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { RootState } from '@/lib/redux/store';



const projectTypes = [
  { value: 'Commercial', label: 'Commercial', icon: Building },
  { value: 'Industrial', label: 'Industrial', icon: Building },
  { value: 'Residential', label: 'Residential', icon: Building },
  { value: 'Institutional', label: 'Institutional', icon: Building },
];

const priorityLevels = [
  { value: 'Low', label: 'Low', color: 'border-muted' },
  { value: 'Medium', label: 'Medium', color: 'border-warning' },
  { value: 'High', label: 'High', color: 'border-accent' },
  { value: 'Urgent', label: 'Urgent', color: 'border-destructive' },
];

const systemOptions = [
  { id: 'vav', name: 'VAV System', icon: Wind },
  { id: 'chilled-water', name: 'Chilled Water', icon: Thermometer },
  { id: 'energy-recovery', name: 'Energy Recovery', icon: Zap },
  { id: 'bms', name: 'BMS', icon: FileText },
  { id: 'process-cooling', name: 'Process Cooling', icon: Thermometer },
  { id: 'compressed-air', name: 'Compressed Air', icon: Wind },
  { id: 'exhaust-ventilation', name: 'Exhaust Ventilation', icon: Wind },
  { id: 'medical-air', name: 'Medical Air', icon: Wind },
  { id: 'isolation-rooms', name: 'Isolation Rooms', icon: Building },
  { id: 'or-ventilation', name: 'OR Ventilation', icon: Wind },
  { id: 'clean-rooms', name: 'Clean Rooms', icon: Building },
  { id: 'hot-water', name: 'Hot Water', icon: Droplets },
  { id: 'steam', name: 'Steam', icon: Thermometer },
];

type CollectInfo = {
  name: string,
  client: string,
  type: 'Commercial' | 'Industrial' | 'Residential' | 'Institutional'| '',
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | '',
  startDate: Date|undefined,
  endDate: Date|undefined,
  budget: string,
  location: string,
  description: string,
  systems: string[],
}
export default function NewProjectPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const user = useSelector((state:RootState)=>state.localStorage.user)
  const { toast } = useToast();
  const [formData, setFormData] = useState<CollectInfo>({
    name: '',
    client: '',
    type: '',
    priority: '',
    startDate: undefined,
    endDate: undefined,
    budget: '',
    location: '',
    description: '',
    systems: [],
  });
  const [error,setError] = useState<boolean>(false)
  // const [newTeamMember, setNewTeamMember] = useState('');

  const handleInputChange = (field: keyof CreateProjectType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemToggle = (systemId: string) => {
    setFormData(prev => ({
      ...prev,
      systems: prev.systems.includes(systemId)
        ? prev.systems.filter(s => s !== systemId)
        : [...prev.systems, systemId]
    }));
  };



  const {mutate, isPending, data} = useMutation({
    mutationFn: (formData: CreateProjectType) => createProject(formData),
    onSuccess: (data) => {
      dispatch(createNew(data));
      toast({
        title: "Success",
        description: "Project created successfully.",
        variant: "destructive",
      });
      setFormData({
        name: '',
        client: '',
        type: '',
        priority: '',
        startDate: undefined,
        endDate: undefined,
        budget: '',
        location: '',
        description: '',
        systems: [],
      });
      navigate(`/project/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project.",
        variant: "destructive",
      });
      setError(true);
    }
  });

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
    formData.client.trim() !== '' && 
    formData.type !== '' && 
    formData.priority !== ''&&
    formData.description.trim()&&
    formData.budget.trim()&&
    formData.location.trim()&&
    formData.systems.length !== 0 &&
     formData.startDate &&
     formData.endDate;
  };


  const handleSubmit = async () => {
    if(!isFormValid){
      setError(true)
      alert("not filled")
      return 
    }
    setError(false)
    if(!user){
      toast({
        title: "sign in to continue",
        description: "sign in"
      })
      return
    } 
    const projectData:CreateProjectType ={
      ...formData,
      startDate:  new Date(formData.startDate).toISOString().split('T')[0],
      endDate:  new Date(formData.endDate).toISOString().split('T')[0],
      access_token: user.access_token
    }
     await mutate(projectData);
    // await dispatch(createNew(projectData))
    if(!data) {
      return;
    }
    const activity:ActivityItem = {
      icon: FolderCheck,
      id: uuidv4(),
      type: "document",
      title: `A new project has been created. (${projectData.name})`,
      time: new Date().toISOString(),
    }
    await dispatch(addActivity(activity))
    // Here you would send the project data to your backend
    // navigate(`/project/${projectData.}`);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-6">
      <div className="w-full flex-wrap lg:flex-nowrap flex gap-3 items-center justify-between">
        <div className="flex flex-wrap lg:flex-nowrap  items-center gap-4">
          {/* <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button> */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Project</h1>
            <p className="text-muted-foreground">
              Create a new HVAC engineering project
            </p>
          </div>
        </div>
        <div className="flex flex-wrap lg:flex-nowrap  items-center gap-2">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      <div className="w-full items-center justify-center flex gap-6">
        {/* Main Form */}
        <div className="w-full space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name 
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client 
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Input
                    id="client"
                    placeholder="Enter client name"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Type 
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority 
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date 
                    <span className="text-gray-300 ml-1">(optional)</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date 
                    <span className="text-gray-300 ml-1">(optional)</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location
                    <span className="text-gray-300 ml-1">(required)</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description
                  <span className="text-gray-300 ml-1">(required)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project scope and requirements..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                HVAC Systems
                <span className="text-gray-300 ml-1">(required)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {systemOptions.map((system) => (
                  <Button
                    key={system.id}
                    variant={formData.systems.includes(system.id) ? "default" : "outline"}
                    className={cn(
                      "h-auto p-3 justify-start transition-smooth",
                      formData.systems.includes(system.id) 
                        ? "bg-gradient-primary text-primary-foreground shadow-elegant" 
                        : "hover:bg-primary/10"
                    )}
                    onClick={() => handleSystemToggle(system.id)}
                  >
                    <system.icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{system.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
      </div>
    </div>
  );
}
        // <div className="space-y-6">
        //   {/* Team Members */}
        //   <Card>
        //     <CardHeader>
        //       <CardTitle className="flex items-center gap-2">
        //         <Users className="w-5 h-5" />
        //         Team Members
        //       </CardTitle>
        //     </CardHeader>
        //     <CardContent className="space-y-4">
        //       <div className="space-y-2">
        //         <Label>Add Team Member</Label>
        //         <div className="flex gap-2">
        //           <Input
        //             placeholder="Enter name"
        //             value={newTeamMember}
        //             onChange={(e) => setNewTeamMember(e.target.value)}
        //             onKeyPress={(e) => e.key === 'Enter' && handleAddNewTeamMember()}
        //           />
        //           <Button size="sm" onClick={handleAddNewTeamMember}>
        //             <Plus className="w-4 h-4" />
        //           </Button>
        //         </div>
        //       </div>

        //       <Separator />

        //       <div className="space-y-2">
        //         <Label>Quick Add</Label>
        //         <div className="space-y-1">
        //           {teamMembers.filter(member => !formData.team.includes(member)).slice(0, 5).map((member) => (
        //             <Button
        //               key={member}
        //               variant="ghost"
        //               size="sm"
        //               className="w-full justify-start h-8"
        //               onClick={() => handleTeamMemberAdd(member)}
        //             >
        //               <Plus className="w-3 h-3 mr-2" />
        //               {member}
        //             </Button>
        //           ))}
        //         </div>
        //       </div>

        //       {formData.team.length > 0 && (
        //         <>
        //           <Separator />
        //           <div className="space-y-2">
        //             <Label>Selected Team ({formData.team.length})</Label>
        //             <div className="space-y-1">
        //               {formData.team.map((member) => (
        //                 <div
        //                   key={member}
        //                   className="flex items-center justify-between bg-muted rounded-md p-2"
        //                 >
        //                   <span className="text-sm">{member}</span>
        //                   <Button
        //                     variant="ghost"
        //                     size="sm"
        //                     className="h-6 w-6 p-0"
        //                     onClick={() => handleTeamMemberRemove(member)}
        //                   >
        //                     <X className="w-3 h-3" />
        //                   </Button>
        //                 </div>
        //               ))}
        //             </div>
        //           </div>
        //         </>
        //       )}
        //     </CardContent>
        //   </Card>

        //   {/* Project Summary */}
        //   <Card>
        //     <CardHeader>
        //       <CardTitle>Project Summary</CardTitle>
        //     </CardHeader>
        //     <CardContent className="space-y-3">
        //       <div className="flex items-center justify-between text-sm">
        //         <span className="text-muted-foreground">Status</span>
        //         <Badge variant="secondary">Planning</Badge>
        //       </div>
        //       {formData.type && (
        //         <div className="flex items-center justify-between text-sm">
        //           <span className="text-muted-foreground">Type</span>
        //           <span className="capitalize">{formData.type}</span>
        //         </div>
        //       )}
        //       {formData.priority && (
        //         <div className="flex items-center justify-between text-sm">
        //           <span className="text-muted-foreground">Priority</span>
        //           <span className="capitalize">{formData.priority}</span>
        //         </div>
        //       )}
        //       {formData.systems.length > 0 && (
        //         <div className="text-sm">
        //           <span className="text-muted-foreground">Systems</span>
        //           <div className="mt-1 flex flex-wrap gap-1">
        //             {formData.systems.slice(0, 3).map((systemId) => {
        //               const system = systemOptions.find(s => s.id === systemId);
        //               return (
        //                 <Badge key={systemId} variant="outline" className="text-xs">
        //                   {system?.name}
        //                 </Badge>
        //               );
        //             })}
        //             {formData.systems.length > 3 && (
        //               <Badge variant="outline" className="text-xs">
        //                 +{formData.systems.length - 3} more
        //               </Badge>
        //             )}
        //           </div>
        //         </div>
        //       )}
        //       {formData.team.length > 0 && (
        //         <div className="flex items-center justify-between text-sm">
        //           <span className="text-muted-foreground">Team Size</span>
        //           <span>{formData.team.length} members</span>
        //         </div>
        //       )}
        //     </CardContent>
        //   </Card>
        // </div>