import { useState, useCallback } from 'react';
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
  Music
} from 'lucide-react';

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
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
      category: getFileCategory(file.type)
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach(file => {
      simulateFileProcessing(file.id);
    });

    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) are being processed`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const simulateFileProcessing = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (progress >= 50 && file.status === 'uploading') {
            return { ...file, status: 'processing', progress: Math.min(progress, 100) };
          } else if (progress >= 100) {
            clearInterval(interval);
            return { 
              ...file, 
              status: 'completed', 
              progress: 100,
              extractedData: generateMockExtractedData(file.category)
            };
          }
          return { ...file, progress: Math.min(progress, 100) };
        }
        return file;
      }));
    }, 200);
  };

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

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
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
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Document Upload & Processing</h1>
        <p className="text-muted-foreground">
          Upload technical documents, drawings, specifications, and media files for AI analysis
        </p>
      </div>

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

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Processing Files ({files.length})
          </h3>
          <div className="space-y-4">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.category);
              return (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-10 h-10 bg-gradient-card rounded-lg flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {file.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {file.status === 'uploading' ? 'Uploading...' :
                           file.status === 'processing' ? 'Processing...' :
                           file.status === 'completed' ? 'Completed' : 'Error'}
                        </span>
                        <span className="text-xs text-muted-foreground">{file.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={file.progress} className="h-1" />
                    </div>

                    {/* Extracted Data */}
                    {file.extractedData && (
                      <p className="text-xs text-success mt-2">{file.extractedData}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' || file.status === 'processing' ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : file.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
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