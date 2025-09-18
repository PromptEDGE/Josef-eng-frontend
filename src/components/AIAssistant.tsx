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
  Paperclip,
  Dot
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import MessageFile from './MessageFile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useParams } from 'react-router-dom';
import { ActivityItem, LibraryItem, Message, ProjectData, Proposal } from '@/utils/types';
import { getFile } from '@/lib/redux/slice/librarySlice';
import UploadBtnWrap from './UploadBtnWrap';
import { getFileReaderUrl } from '@/utils/fileReader';
import { createNewProposal } from '@/lib/redux/slice/proposalSlice';
import { addActivity } from '@/lib/redux/slice/activitySlice';
import useSendMessage from '@/hooks/useSendMessage';
import useUploadDocument from '@/hooks/useUploadFiles';



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
type ProjectHistory = {
  role: string;
  content: string;
};

type ProjectDetails = {
  project_budget: string;
  project_client: string;
  project_description: string;
  project_end_date: string;
  project_id: string;
  project_location: string;
  project_name: string;
  project_priority: string;
  project_start_date: string;
  project_systems: string[];
  project_type: string;
};

type ProjectSource = {
  source: string;
};

type ResponseData = {
  answer: string;
  history: ProjectHistory[];
  prompt: string;
  project: ProjectDetails;
  user: string;
  sources: ProjectSource[];
};

export function AIAssistant() {
  const params = useParams()
  const uid = params.uid as string ;
  const { sendMessage, isPending:MsgLoading, isError:MsgError } = useSendMessage()
  const { uploadFile, isPending:FileLoading, isError:FileError } = useUploadDocument()
  const dispatch = useDispatch()
  const projects = useSelector((state:RootState)=>state.project.project)
  const user = useSelector((state:RootState)=>state.localStorage.user)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [files, setFiles] = useState<File|undefined>(undefined);
  const [preview,setPreview] = useState<string>("")
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [project,setProject] = useState<ProjectData|null>(null)
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const findProject = useCallback(()=>{
    const project = projects.find(item=>item.id.toLowerCase()===uid)
    if(project){
      setProject(project)
    }
  },[uid,projects])





  const handleSendMessage = async () => {
    let localUrl: string;
    setPreview("")
    // send prompt to ai and get response back
    await sendMessage({id:project.id,access:user?.access_token,message:inputValue},{
      onSuccess: (data)=>{
        const res:ResponseData = data
        const assistantMessage: Message = {
          id: uuidv4(),
          type: 'assistant',
          content: {
            text: res.answer,
            // fileUrl: localUrl
          },
          timestamp: new Date().toISOString(),
          category: detectCategory(inputValue),
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        };
        setMessages(prev=>[...prev,assistantMessage])
      },
      onError: (error)=>{
        console.log(error)
      }
    })

    // update ui message
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: {
        text: inputValue,
        fileUrl: localUrl,
        },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
      
  };

  const detectCategory = (input: string): Message['category'] => {
    const lower = input.toLowerCase();
    if (lower.includes('calculate') || lower.includes('load') || lower.includes('size')) return 'calculation';
    if (lower.includes('standard') || lower.includes('ashrae') || lower.includes('code')) return 'standard';
    if (lower.includes('design') || lower.includes('recommend') || lower.includes('layout')) return 'design';
    if (lower.includes('troubleshoot') || lower.includes('problem') || lower.includes('fix')) return 'troubleshooting';
    return 'general';
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
  const selectedFile = e.target.files[0]

    if (selectedFile) {
      await setFiles(selectedFile)
      setShowUpload(false)

      const url = await getFileReaderUrl(selectedFile)
      setPreview(url)
      const fileType = files.type.startsWith('video')  ? 'VIDEO'
         : files.type.startsWith('image') ? 'IMAGE' 
         : files.type.startsWith('audio') ? 'AUDIO' 
         : 'DOCUMENT';

        await uploadFile(
          {type: fileType,file:files,projId:project.id,access_token:user?.access_token},
          {
            onSuccess: async (data)=>{
              const res:ResponseData = data
              console.log(res)
            },
            onError: (error)=>{
              console.log(error)
              setPreview("")
              toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
              })
            }
          }
        )
        
    }
  }



  useEffect(() => {
    findProject()
    scrollToBottom();
  }, [messages,findProject]);


  return (
    <div className="relative p-6 h-full flex flex-col">
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
            {messages?.map((message) => (
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
                    
                    {/* {message.content.fileUrl&&<MessageFile message={message.content.fileUrl} />} */}
                    {message.content.text&&<div className="whitespace-pre-wrap text-sm">{message.content.text}</div>}
                    
                    
                    {message.type === 'assistant' && (
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                          {/* <div className="flex items-center gap-2">
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
                          </div> */}
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
                            {/* <Button onClick={()=>createProposal(message.content.text)} variant="ghost"size='sm' className="" >
                              create proposal
                            </Button> */}
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
            
            {MsgLoading && (
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
            {MsgError||FileError&&(
              <div className="flex justify-center items-center w-full">
                <p className="text-center text-red-500 text-sm  ">An error occurred while processing your request. Please try again later.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        {showUpload&&<div className="w-[300px] z-50 backdrop-blur p-3 absolute rounded-lg shadow bottom-[180px] ">
          <UploadBtnWrap show={showUpload} changeFile={changeFile} />
        </div>}
        <div className="p-4 relative flex flex-col gap-6 border-t border-border">
            {preview&&<div className="w-full h-full flex items-start justify-start gap-1 ">
                <MessageFile  message={preview} uploading={FileLoading} />
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
                    disabled={(!inputValue.trim()) || MsgLoading}
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