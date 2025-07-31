import { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Brain, 
  User, 
  FileText, 
  Calculator, 
  Lightbulb, 
  Search,
  Mic,
  MicOff,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Paperclip
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import MessageFile from './MessageFile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useParams } from 'react-router-dom';
import { ActivityItem, LibraryItem, Message, ProjectData, Proposal } from '@/utils/types';
import { updateProject } from '@/lib/redux/slice/projectSlice';
import { getFile } from '@/lib/redux/slice/librarySlice';
import UploadBtnWrap from './UploadBtnWrap';
import { getFileReaderUrl } from '@/utils/fileReader';
import { createNewProposal } from '@/lib/redux/slice/proposalSlice';
import { addActivity } from '@/lib/redux/slice/activitySlice';



const predefinedQuestions = [
  {
    question: "Calculate cooling load for a 5000 sq ft office space",
    category: "calculation",
    icon: Calculator
  },
  {
    question: "What are the latest ASHRAE 90.1 requirements for HVAC efficiency?",
    category: "standard",
    icon: FileText
  },
  {
    question: "Design recommendations for data center cooling",
    category: "design",
    icon: Lightbulb
  },
  {
    question: "Troubleshoot low refrigerant pressure in chiller system",
    category: "troubleshooting",
    icon: Search
  }
];

export function AIAssistant() {
  const params = useParams()
  const dispatch = useDispatch()
  const projects = useSelector((state:RootState)=>state.project.project)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File|undefined>(undefined);
  const [preview,setPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [project,setProject] = useState<ProjectData|null>(null)
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const findProject = useCallback(()=>{
    const project = projects.find(item=>item.uid.toLowerCase()===String(params.uid.toLowerCase()))
    if(project){
      setProject(project)
      setMessages(project.conversation)
    }
  },[params.uid,projects])


    const readableSize = (size: number) => {
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
      }
      return `${size.toFixed(1)} ${units[i]}`;
    };
    const getType = (mime: string): 'video' | 'audio' | 'document' => {
      if (mime.startsWith('video')) return 'video';
      if (mime.startsWith('audio')) return 'audio';
      return 'document';
    };

  const handleSendMessage = async () => {
    // if (!inputValue.trim() || isLoading) return;
    let localUrl: string;
    // if there is file send also and turn to string
    if (file) {
        const filedata = new FormData();
        filedata.append('file', file);

        const formFile = filedata.get('file') as File;
        localUrl = await getFileReaderUrl(formFile);
        const library: LibraryItem = {
          id: uuidv4(),
          name: file.name,
          type: getType(file.type),
          size: readableSize(file.size),
          // uploadedBy: 'current-user-id', // Replace with actual user ID
          uploadedAt: new Date(),
          tags: [],
          thumbnail: localUrl, // Optional: assign local preview to thumbnail
        };

        // If it's a video or audio file, get the duration
        if (file.type.startsWith('video') || file.type.startsWith('audio')) {
          const media = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
          media.preload = 'metadata';
          media.onloadedmetadata = () => {
            const duration = media.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            library.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          };
          media.src = localUrl;
        } else {
          console.log('LibraryItem:', library);
        }

      await dispatch(getFile(library))
      const activity:ActivityItem = {
        icon: FileText,
        id: uuidv4(),
        type: "document",
        title: "You uploaded a document to your library.",
        time: new Date().toISOString(),
      }
      await dispatch(addActivity(activity))
    }
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: {
        text: inputValue,
        fileUrl: localUrl,
        },
      timestamp: new Date().toISOString()
    };
    await dispatch(updateProject({message: userMessage,uid:params.uid}))
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setFile(undefined)
    setPreview("")

    // Simulate AI response
    if(inputValue.trim()){
      const assistantMessage: Message = {
          id: uuidv4(),
          type: 'assistant',
          content: {
           text: inputValue.trim() && generateAIResponse(inputValue),
            // fileUrl: localUrl
          },
          timestamp: new Date().toISOString(),
          category: detectCategory(inputValue),
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        };
        await dispatch(updateProject({message: assistantMessage,uid:params.uid}))
        setMessages(prev => [...prev, assistantMessage]);
    } 
      
      setIsLoading(false);
  };

  const detectCategory = (input: string): Message['category'] => {
    const lower = input.toLowerCase();
    if (lower.includes('calculate') || lower.includes('load') || lower.includes('size')) return 'calculation';
    if (lower.includes('standard') || lower.includes('ashrae') || lower.includes('code')) return 'standard';
    if (lower.includes('design') || lower.includes('recommend') || lower.includes('layout')) return 'design';
    if (lower.includes('troubleshoot') || lower.includes('problem') || lower.includes('fix')) return 'troubleshooting';
    return 'general';
  };

  const generateAIResponse = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes('cooling load') || lower.includes('calculate')) {
      return `Based on your request for cooling load calculation, I'll help you determine the requirements for a 5000 sq ft office space:

**Heat Load Components:**
• Sensible heat gain from occupants: ~45,000 BTU/hr (150 people × 300 BTU/hr)
• Lighting load: ~25,000 BTU/hr (2.5 W/sq ft × 3.41 BTU/W)
• Equipment load: ~30,000 BTU/hr (estimated)
• Solar/envelope gains: ~20,000 BTU/hr (varies by orientation)

**Total Cooling Load:** ~120,000 BTU/hr (10 tons)

**Recommendations:**
• Consider variable air volume (VAV) system for efficiency
• Use ASHRAE 62.1 for ventilation requirements (15 cfm/person minimum)
• Include 10-15% safety factor for design conditions

Would you like me to provide detailed calculations for any specific component?`;
    }
    
    if (lower.includes('ashrae') || lower.includes('standard')) {
      return `Here are the key ASHRAE 90.1-2019 requirements for HVAC efficiency:

**Equipment Efficiency Requirements:**
• Air-cooled chillers >150 tons: minimum 9.562 EER, 14.04 IPLV
• Water-cooled chillers >300 tons: minimum 5.50 COP, 6.84 IPLV
• Packaged AC units: varies by capacity (13-14.4 EER typical)

**System Requirements:**
• Economizer controls required for units >54,000 BTU/hr in most climates
• Variable speed drives required for fans >7.5 HP
• Energy recovery required for systems >5,000 cfm with >70% outside air

**Building Envelope:**
• Updated insulation requirements
• Window performance standards (U-factor and SHGC)

Need specific details for your project's equipment or climate zone?`;
    }

    if (lower.includes('data center')) {
      return `For data center cooling design, here are my recommendations:

**Cooling Strategy:**
• Precision air conditioning units with close-coupled cooling
• Hot aisle/cold aisle containment to improve efficiency
• Target supply temperature: 64-72°F, return temp: 80-85°F

**Redundancy Requirements:**
• N+1 minimum for critical loads
• Consider 2N for high-availability requirements
• Independent cooling zones for different IT equipment

**Efficiency Measures:**
• Variable speed fans and pumps
• Economizer operation when ambient conditions allow
• Consider liquid cooling for high-density racks (>15kW per rack)

**Monitoring:**
• Temperature and humidity sensors throughout space
• Power usage effectiveness (PUE) monitoring
• Integration with building management system

Would you like specific equipment recommendations or load calculations?`;
    }

    return `I understand you're asking about "${input}". As your AI engineering assistant, I have access to extensive HVAC knowledge including:

• Technical standards (ASHRAE, SMACNA, NFPA)
• Equipment specifications and performance data
• Design best practices and methodologies
• Energy efficiency strategies
• Code compliance requirements

Could you provide more specific details about your project requirements? This will help me give you more targeted recommendations and calculations.`;
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice input activated",
        description: "Start speaking your question",
      });
    } else {
      toast({
        title: "Voice input stopped",
        description: "Processing your voice input",
      });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied successfully",
    });
  };
  const changeFile = async (e: ChangeEvent<HTMLInputElement>)=>{
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile)
      const url = await getFileReaderUrl(selectedFile)
      setPreview(url)
    }
  }
  const createProposal = async (conversation: string)=> {
    const { 
        uid:project_uid,
        name: projectName,
        type:projectType,
        priority,
        startDate,
        endDate,
        budget,
        description,
        systems,
        location,
        client
    } = project
    const create: Proposal ={
      id: uuidv4(),
      client,
      project_uid,
      projectName,
      projectType,
      priority,
      startDate,
      endDate,
      budget,
      location,
      description,
      systems,
      createdAt: new Date().toISOString(),
      conversation,
    } 
    await dispatch(createNewProposal(create))
    const activity:ActivityItem = {
      icon: FileText,
      id: uuidv4(),
      type: "document",
      title: "You have created a proposal.",
      time: new Date().toISOString(),
    }
    await dispatch(addActivity(activity))
  }
  useEffect(() => {
    findProject()
    scrollToBottom();
  }, [messages,findProject]);
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Engineering Assistant</h1>
        <p className="text-muted-foreground">
          Get instant help with calculations, standards, design, and troubleshooting
        </p>
      </div>

      {/* Quick Questions */}
      {/* <Card className="p-4 mb-6">
        <h3 className="font-semibold text-foreground mb-3">Quick Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {predefinedQuestions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start h-auto p-3 text-left"
              onClick={() => handleQuestionClick(item.question)}
            >
              <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{item.question}</span>
            </Button>
          ))}
        </div>
      </Card> */}

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type !== 'user' && (
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-3 rounded-lg  flex flex-col gap-2 items-start justify-start ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.type === 'system'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    
                    {message.content.fileUrl&&<MessageFile message={message.content.fileUrl} />}
                    {message.content.text&&<div className="whitespace-pre-wrap text-sm">{message.content.text}</div>}
                    
                    
                    {message.type === 'assistant' && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                        <div className="flex items-center gap-2">
                          {message.category && (
                            <Badge variant="secondary" className="text-xs">
                              {message.category}
                            </Badge>
                          )}
                          {message.confidence && (
                            <span className="text-xs opacity-70">
                              {Math.round(message.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(message.content.text)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                          <Button onClick={()=>createProposal(message.content.text)} variant="ghost"size='sm' className="" >
                            create proposal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-xs text-muted-foreground mt-1 ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing your question...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 relative space-y-3 border-t border-border">
          <UploadBtnWrap show={showUpload} changeFile={changeFile} />
          {preview&&<div className="w-[300px] h-[200px] flex flex-col items-center justify-center ">
            <MessageFile message={preview} />
          </div>}
          <div className="flex gap-2">
            <Button 
            onClick={()=>setShowUpload(prev=>!prev)}
            variant="outline" size="sm" className="px-2">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about calculations, standards, design recommendations..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !file) || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Ask about HVAC calculations, equipment sizing, energy codes, troubleshooting, or design recommendations
          </p>
        </div>
      </Card>
    </div>
  );
}