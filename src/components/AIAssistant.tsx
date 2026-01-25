import { logger } from "@/utils/logger";
import { useState, useRef, useEffect, useCallback, ChangeEvent, ReactNode, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
  XCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import MessageFile from './MessageFile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useParams } from 'react-router-dom';
import { ActivityItem, Message, ProjectData, Proposal } from '@/utils/types';
import { createNewProposal } from '@/lib/redux/slice/proposalSlice';
import { addActivity } from '@/lib/redux/slice/activitySlice';
import useSendMessage from '@/hooks/useSendMessage';
import useUploadFiles, { UploadStatus } from '@/hooks/useUploadFiles';
import useProjectChat from '@/hooks/useProjectChat';
import UploadBtnWrap from './UploadBtnWrap';
import { Progress } from '@/components/ui/progress';



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
  const {
    uploads: projectUploads,
    uploadFiles: queueProjectUploads,
    cancelUpload: cancelProjectUpload,
    removeUpload: removeProjectUpload,
    isUploading: isUploadingProject,
    clearUploads: clearProjectUploadsUi,
    retryUpload: retryProjectUpload,
  } = useUploadFiles()
  const dispatch = useDispatch()
  const projects = useSelector((state:RootState)=>state.project.project)
  const { project: projectDetail, messages, isLoading: isProjectLoading, appendMessage } = useProjectChat(uid);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [showUploadOptions, setShowUploadOptions] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const handledUploadIdsRef = useRef(new Set<string>());
  const [uploadedFilesData, setUploadedFilesData] = useState<Array<{
    filename: string;
    file_type: string;
    full_content: string;
  }>>([]);

  // Computed state: Check if any upload is actively in progress
  const hasActiveUploads = useMemo(() => {
    return projectUploads.some(upload =>
      upload.status === 'uploading' ||
      upload.status === 'queued'
    );
  }, [projectUploads]);

  const uploadStatusConfig: Record<UploadStatus, { label: string; variant: 'secondary' | 'outline' | 'destructive' }> = {
    queued: { label: 'Queued', variant: 'outline' },
    uploading: { label: 'Uploading', variant: 'outline' },
    success: { label: 'Uploaded', variant: 'secondary' },
    error: { label: 'Failed', variant: 'destructive' },
    canceled: { label: 'Canceled', variant: 'outline' },
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.min(
      units.length - 1,
      Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024)))
    );
    const size = bytes / Math.pow(1024, index);
    return `${size.toFixed(1)} ${units[index]}`;
  }

  const renderFormattedText = (text: string): ReactNode[] => {
    const fragments: ReactNode[] = [];
    const segments = text.split(/(\*\*[^*]+\*\*)/g);

    segments.forEach((segment, segIndex) => {
      if (!segment) {
        return;
      }

      const isBold = segment.startsWith('**') && segment.endsWith('**');
      if (isBold) {
        const content = segment.slice(2, -2);
        fragments.push(
          <strong key={`bold-${segIndex}`}>{content}</strong>
        );
        return;
      }

      const lines = segment.split('\n');
      lines.forEach((line, lineIndex) => {
        fragments.push(
          <span key={`text-${segIndex}-${lineIndex}`}>{line}</span>
        );
        if (lineIndex < lines.length - 1) {
          fragments.push(<br key={`br-${segIndex}-${lineIndex}`} />);
        }
      });
    });

    return fragments;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const project = useMemo<ProjectData | null>(() => {
    if (!uid) return null;
    if (projectDetail) return projectDetail;
    const fallback = projects.find(item => item.id.toLowerCase() === uid?.toLowerCase());
    return fallback ?? null;
  }, [projectDetail, projects, uid]);

  const handleSendMessage = async () => {
    const prompt = inputValue.trim();

    // CRITICAL: Block sending if uploads in progress
    if (hasActiveUploads) {
      toast({
        title: 'Upload in progress',
        description: 'Please wait for file uploads to complete before sending a message',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    if (!prompt && uploadedFilesData.length === 0) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message or upload a file',
        variant: 'destructive',
      });
      return;
    }

    if (!project) {
      toast({
        title: 'Project unavailable',
        description: 'Select or create a project before starting a chat.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: {
        text: prompt,
      },
      timestamp: new Date().toISOString(),
    };

    if(projectUploads.length>0&&!isUploadingProject){
      clearProjectUploadsUi();
    }

    appendMessage(userMessage);
    setInputValue('');

    sendMessage(
      {
        id: project.id,
        message: prompt,
        uploadedFiles: uploadedFilesData.length > 0 ? uploadedFilesData : undefined
      },
      {
        onSuccess: (data) => {
          const res: ResponseData = data;
          const assistantMessage: Message = {
            id: uuidv4(),
            type: 'assistant',
            content: {
              text: res.answer,
            },
            timestamp: new Date().toISOString(),
            category: detectCategory(prompt),
            confidence: Math.random() * 0.3 + 0.7,
          };
          appendMessage(assistantMessage);

          // Clear uploaded files data after successful response
          setUploadedFilesData([]);
        },
        onError: (error) => {
          logger.debug(error);
          toast({
            title: 'Unable to send message',
            description: 'Please try again in a moment.',
            variant: 'destructive',
          });
          appendMessage({
            id: uuidv4(),
            type: 'system',
            content: {
              text: 'Message failed to send. Please try again.',
            },
            timestamp: new Date().toISOString(),
          });
        },
      }
    );
  };

  const handleProjectFileSelection = useCallback(
    (event?: ChangeEvent<HTMLInputElement>) => {
      if (!project) {
        toast({
          title: 'Project unavailable',
          description: 'Select or create a project before uploading files.',
          variant: 'destructive',
        });
        return;
      }

      const fileList = event?.target?.files;
      if (!fileList || fileList.length === 0) {
        return;
      }

      const files = Array.from(fileList);
      queueProjectUploads({ files, projectId: project.id });
      setShowUploadOptions(false);
    },
    [project, queueProjectUploads, toast]
  );

  const detectCategory = (input: string): Message['category'] => {
    const lower = input.toLowerCase();
    if (lower.includes('calculate') || lower.includes('load') || lower.includes('size')) return 'calculation';
    if (lower.includes('standard') || lower.includes('ashrae') || lower.includes('code')) return 'standard';
    if (lower.includes('design') || lower.includes('recommend') || lower.includes('layout')) return 'design';
    if (lower.includes('troubleshoot') || lower.includes('problem') || lower.includes('fix')) return 'troubleshooting';
    return 'general';
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      logger.error('Speech recognition error:', event);
      setIsListening(false);
      const description = event?.error === 'not-allowed'
        ? 'Microphone access was denied. Please enable it in your browser settings.'
        : 'An error occurred while listening. Please try again.';
      toast({
        title: 'Voice input error',
        description,
        variant: 'destructive',
      });
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0]?.transcript ?? '';
        }
      }

      finalTranscript = finalTranscript.trim();
      if (finalTranscript) {
        setInputValue((prev) => {
          if (!prev) return finalTranscript;
          const separator = prev.endsWith(' ') ? '' : ' ';
          return `${prev}${separator}${finalTranscript}`;
        });
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onstart = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch (error) {
        // ignore stop errors on cleanup
      }
      recognitionRef.current = null;
    };
  }, [toast]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !isSpeechSupported) {
      toast({
        title: 'Voice input unavailable',
        description: 'Your browser does not support speech recognition.',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      toast({
        title: 'Voice input stopped',
        description: 'Processing your voice input.',
      });
    } else {
      try {
        recognition.start();
        toast({
          title: 'Voice input activated',
          description: 'Start speaking your question.',
        });
      } catch (error) {
        logger.error('Failed to start speech recognition:', error);
        toast({
          title: 'Unable to start voice input',
          description: 'Microphone may be in use or permission was denied.',
          variant: 'destructive',
        });
      }
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied successfully",
    });
  };


  // const changeFile = async (e: ChangeEvent<HTMLInputElement>)=>{
  // const selectedFile = e.target.files[0]

  //   if (selectedFile) {
  //     await setFiles(selectedFile)
  //     setShowUpload(false)

  //     const url = await getFileReaderUrl(selectedFile)
  //     setPreview(url)
  //     const fileType = files.type.startsWith('video')  ? 'VIDEO'
  //        : files.type.startsWith('image') ? 'IMAGE' 
  //        : files.type.startsWith('audio') ? 'AUDIO' 
  //        : 'DOCUMENT';

  //       await uploadFile(
  //         {type: fileType,file:files,projId:project.id,access_token:user?.access_token},
  //         {
  //           onSuccess: async (data)=>{
  //             const res:ResponseData = data
  //             logger.debug(res)
  //           },
  //           onError: (error)=>{
  //             logger.debug(error)
  //             setPreview("")
  //             toast({
  //               title: "Error",
  //               description: error.message,
  //               variant: "destructive",
  //             })
  //           }
  //         }
  //       )
        
  //   }
  // }



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    projectUploads.forEach((task) => {
      if (!['success', 'error', 'canceled'].includes(task.status)) {
        return;
      }

      if (handledUploadIdsRef.current.has(task.id)) {
        return;
      }

      handledUploadIdsRef.current.add(task.id);

      if (task.status === 'success') {
        toast({
          title: 'Upload complete',
          description: `${task.file.name} uploaded successfully.`,
        });

        // Store uploaded file data for sending with chat requests
        if (task.data && typeof task.data === 'object') {
          const responseData = task.data as any;
          if (responseData.full_content && responseData.filename && responseData.file_type) {
            setUploadedFilesData(prev => [...prev, {
              filename: responseData.filename,
              file_type: responseData.file_type,
              full_content: responseData.full_content
            }]);
          }
        }
      } else if (task.status === 'error') {
        toast({
          title: 'Upload failed',
          description: task.error || `${task.file.name} failed to upload.`,
          variant: 'destructive',
        });
      } else if (task.status === 'canceled') {
        toast({
          title: 'Upload canceled',
          description: `${task.file.name} was canceled.`,
        });
      }
    });
  }, [projectUploads, toast]);
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
            {isProjectLoading && messages.length === 0 && (
              <div className="flex justify-center py-10 text-sm text-muted-foreground">
                Loading conversation…
              </div>
            )}
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
                    
                    {message.content.fileUrl&&<MessageFile message={message.content.fileUrl} />}
                    {message.content.text && (
                      <div className="text-sm whitespace-pre-wrap">
                        {renderFormattedText(message.content.text)}
                      </div>
                    )}
                    
                    
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
            {MsgError && (
              <div className="flex justify-center items-center w-full">
                <p className="text-center text-red-500 text-sm  ">An error occurred while processing your request. Please try again later.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 space-y-4 border-t border-border">
          {showUploadOptions && <div className="absolute bottom-[150px] z-30 w-[180px] p-3 shadow bg-transparent backdrop-blur rounded-lg ">
            <UploadBtnWrap show={showUploadOptions} changeFile={handleProjectFileSelection} />
          </div>}

          <>
            {hasActiveUploads && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>File upload in progress. Messaging disabled until upload completes.</span>
              </div>
            )}
            {projectUploads.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Project uploads</h4>
                  <span className="text-xs text-muted-foreground">
                    {projectUploads.filter((task) => task.status === 'uploading' || task.status === 'queued').length} in progress
                  </span>
                </div>
                <div className="space-y-3">
                  {projectUploads.map((task) => {
                    const statusMeta = uploadStatusConfig[task?.status];
                    const canCancel = task.status === 'uploading' || task.status === 'queued';
                    const canRemove = task.status === 'success' || task.status === 'error' || task.status === 'canceled';

                    return (
                      <div key={task.id} className="rounded-lg border border-border bg-card px-3 py-2 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{task.file.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {formatFileSize(task.file.size)} · {task.messageType.toLowerCase()} · {task.file.type || 'unknown type'}
                            </p>
                          </div>
                          <Badge variant={statusMeta?.variant}>{statusMeta?.label}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Progress 
                          value={task.progress} 
                          className="h-1.5 [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-in-out" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{task.progress}%</span>
                            {task.error && <span className="text-destructive">{task.error}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <Button variant="destructive" size="sm" onClick={() => cancelProjectUpload(task.id)}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          )}
                          {task.status === 'error' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => retryProjectUpload(task.id)}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Retry
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeProjectUpload(task.id)}>
                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                              </Button>
                            </>
                          )}
                          {task.status !== 'error' && canRemove && (
                            <Button variant="ghost" size="sm" onClick={() => removeProjectUpload(task.id)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-2"
                onClick={() => setShowUploadOptions((prev) => !prev)}
                disabled={!project || isUploadingProject}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about calculations, standards, design recommendations..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={toggleListening}
                  disabled={!isSpeechSupported}
                  aria-label={isSpeechSupported ? 'Toggle voice input' : 'Voice input not supported'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0",
                      hasActiveUploads && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={handleSendMessage}
                    disabled={
                      !inputValue.trim() ||
                      MsgLoading ||
                      !project ||
                      hasActiveUploads
                    }
                    title={hasActiveUploads ? "Upload in progress..." : "Send message"}
                  >
                    {MsgLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : hasActiveUploads ? (
                      <span className="text-xs">⏳</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ask about HVAC calculations, equipment sizing, energy codes, troubleshooting, or design recommendations
            </p>
        </div>
      </div>
      </Card>
    </div>
  );
}
