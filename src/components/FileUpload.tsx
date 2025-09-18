import { useState, useCallback } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Image,
  Video,
  Music,
  Loader2Icon
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import useUploadDocument from '@/hooks/useUploadFiles';
import { ProjectData } from '@/utils/types';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  category?: 'pdf' | 'excel' | 'word' | 'cad' | 'image' | 'video' | 'audio' | 'other';
  extractedData?: string;
}

const getFileCategory = (type: string): UploadedFile['category'] => {
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('sheet') || type.includes('excel')) return 'excel';
  if (type.includes('word') || type.includes('document')) return 'word';
  if (type.includes('dwg') || type.includes('autocad')) return 'cad';
  if (type.includes('image')) return 'image';
  if (type.includes('video')) return 'video';
  if (type.includes('audio')) return 'audio';
  return 'other';
};

const getFileIcon = (category: UploadedFile['category']) => {
  switch (category) {
    case 'pdf':
    case 'word':
      return FileText;
    case 'excel':
      return File;
    case 'cad':
      return File;
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    default:
      return File;
  }
};

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
  'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
  'audio/*': ['.mp3', '.wav', '.m4a'],
  'application/octet-stream': ['.dwg', '.dxf']
};

export function FileUpload() {
  const { uploadFile, isPending } = useUploadDocument()
  const projects = useSelector((state:RootState)=>state.project.project)
  const user = useSelector((state:RootState)=>state.localStorage.user)
  const [selectedProject, setSelectedProject] = useState<ProjectData|null>(null);
  const [file, setFile] = useState<File|null>(null);
  const { toast } = useToast();

  const upload = async()=>{
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    if(!selectedProject){
      toast({
        title: "Error",
        description: "Please select a project to upload the file to.",
        variant: "destructive",
      });
      return;
    }
    await uploadFile({
      projId:selectedProject.id,
      access_token:user?.access_token,
      type:file.type.startsWith('video')  ? 'VIDEO' : file.type.startsWith('image') ? 'IMAGE' : file.type.startsWith('audio') ? 'AUDIO' : 'DOCUMENT',
      file:file},{
        onSuccess:()=>{
          toast({
            title: "File uploaded",
            description: `${file.name} has been uploaded`,
          });
          setFile(null);
        },
        onError:(error)=>{
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          setFile(null);
        }
      })
  }
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Only accept the first file, replace any previous file
      setFile(acceptedFiles[0]);
      toast({
        title: "File uploaded",
        description: `${acceptedFiles[0].name} is ready for preview and upload`,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const generateMockExtractedData = (category: UploadedFile['category']): string => {
    switch (category) {
      case 'pdf':
        return 'Extracted: ASHRAE 90.1 Standard, Energy efficiency requirements, Minimum equipment performance standards';
      case 'excel':
        return 'Processed: Load calculations, Equipment specifications, Cost analysis data';
      case 'word':
        return 'Analyzed: Technical specifications, Project requirements, Design criteria';
      case 'cad':
        return 'Parsed: HVAC layout, Equipment locations, Ductwork routing, Dimensions';
      default:
        return 'File processed and indexed in knowledge base';
    }
  };

  const removeFile = (file: null|File) => {
    setFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="w-full flex items-center justify-between flex-wrap sm:flex-nowrap ">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Document Upload & Processing</h1>
          <p className="text-muted-foreground">
            Upload technical documents, drawings, specifications, and media files for AI analysis
          </p>
        </div>
        {/* Upload Button (shadcn/ui) */}
        <div className="flex justify-center mb-6">
          <Button
            variant="default"
            size="lg"
            className="gap-2 px-6 py-3 text-base font-semibold shadow-md"
            onClick={upload}
            disabled={isPending}
          >
            {isPending?(
              <>
                <Loader2Icon className='w-5 h-5 animate-spin' /> Uploading...
              </>
              )
              :
              (
                <>
                  <Upload className="w-5 h-5" /> Upload
                </>
            )}
          </Button>
        </div>
      </div>
      {/* Project Dropdown (shadcn/ui Select) */}
      {/* {projects && projects.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">Select Project</label>
          <Select
            value={selectedProject ? selectedProject.id : ""}
            onValueChange={id => {
              const proj = projects.find((p: ProjectData) => p.id === id) || null;
              setSelectedProject(proj);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project: ProjectData) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name || `Project ${project.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )} */}



      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-border hover:border-primary transition-smooth">
        <div
          {...getRootProps()}
          className={`p-8 text-center cursor-pointer transition-smooth ${
            isDragActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-muted-foreground mt-1">
                or click to browse files (PDF, Excel, Word, CAD, Images, Videos, Audio)
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Maximum file size: 100MB
              </p>
            </div>
            <Button variant="outline">
              Browse Files
            </Button>
          </div>
        </div>
      </Card>

      {/* File Preview */}
      {file && (
        <Card className="p-6 mb-6 flex items-center justify-center flex-col ">
          <h3 className="text-lg font-semibold text-foreground mb-4">File Preview</h3>
          {file.type.startsWith('image') && (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="max-w-full max-h-64 rounded shadow"
            />
          )}
          {file.type.startsWith('video') && (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-w-full max-h-64 rounded shadow"
            />
          )}
          {file.type.startsWith('audio') && (
            <audio
              src={URL.createObjectURL(file)}
              controls
              className="w-full"
            />
          )}
          {file.type === 'application/pdf' && (
            <iframe
              src={URL.createObjectURL(file)}
              title={file.name}
              className="w-full h-64 border rounded"
            />
          )}
          {!file.type.startsWith('image') &&
            !file.type.startsWith('video') &&
            !file.type.startsWith('audio') &&
            file.type !== 'application/pdf' && (
            <div className="text-muted-foreground">
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Type:</strong> {file.type}</p>
            </div>
          )}
        </Card>
      )}

      {/* Supported File Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Supported File Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Documents</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• PDF - Technical manuals, standards</p>
              <p>• Word - Specifications, reports</p>
              <p>• Excel - Calculations, equipment lists</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">CAD & Technical</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• DWG - AutoCAD drawings</p>
              <p>• DXF - CAD exchange format</p>
              <p>• IFC - Building information models</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Media</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Images - Equipment photos, diagrams</p>
              <p>• Video - Site visits, inspections</p>
              <p>• Audio - Voice notes, meetings</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}