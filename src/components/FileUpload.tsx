import { logger } from "@/utils/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image,
  Video,
  Music,
  Clock3,
  XCircle,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import useUploadFiles, { UploadStatus, UploadTask } from '@/hooks/useUploadFiles';
import { v4 as uuidv4 } from 'uuid';

interface SelectedFileInfo {
  id: string;
  file: File;
}

type FileCategory = 'pdf' | 'excel' | 'word' | 'cad' | 'image' | 'video' | 'audio' | 'other';

const getFileCategory = (type: string): FileCategory => {
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('sheet') || type.includes('excel')) return 'excel';
  if (type.includes('word') || type.includes('document')) return 'word';
  if (type.includes('dwg') || type.includes('autocad')) return 'cad';
  if (type.includes('image')) return 'image';
  if (type.includes('video')) return 'video';
  if (type.includes('audio')) return 'audio';
  return 'other';
};

const getFileIcon = (category: FileCategory) => {
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
  'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.heic'],
  'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
  'audio/*': ['.mp3', '.wav', '.m4a'],
  'application/octet-stream': ['.dwg', '.dxf'],
};

const statusConfig: Record<UploadStatus, { label: string; badgeVariant: 'secondary' | 'outline' | 'destructive'; icon: LucideIcon }> = {
  queued: { label: 'Queued', badgeVariant: 'outline', icon: Clock3 },
  uploading: { label: 'Uploading', badgeVariant: 'outline', icon: Loader2 },
  success: { label: 'Uploaded', badgeVariant: 'secondary', icon: CheckCircle2 },
  error: { label: 'Failed', badgeVariant: 'destructive', icon: AlertCircle },
  canceled: { label: 'Canceled', badgeVariant: 'outline', icon: XCircle },
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export function FileUpload() {
  const { uploads, uploadFiles, cancelUpload, removeUpload, resetUploads, isUploading } = useUploadFiles();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileInfo[]>([]);
  const { toast } = useToast();
  const completedIdsRef = useRef(new Set<string>());

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) {
        return;
      }

      setSelectedFiles((prev) => {
        const newFiles = acceptedFiles.map((file) => ({ id: uuidv4(), file }));
        return [...prev, ...newFiles];
      });

      toast({
        title: `${acceptedFiles.length} file${acceptedFiles.length > 1 ? 's' : ''} added`,
        description: 'Review the files below before uploading.',
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: 100 * 1024 * 1024,
    multiple: true,
    noClick: true,
  });

  const handleRemovePendingFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFiles.length) {
      toast({
        title: 'No files selected',
        description: 'Add one or more files to upload.',
        variant: 'destructive',
      });
      return;
    }

    await uploadFiles({
      files: selectedFiles.map((item) => item.file),
    });

    setSelectedFiles([]);
  }, [selectedFiles, toast, uploadFiles]);

  useEffect(() => {
    uploads.forEach((task) => {
      if (!['success', 'error', 'canceled'].includes(task.status)) return;
      if (completedIdsRef.current.has(task.id)) return;

      completedIdsRef.current.add(task.id);

      if (task.status === 'success') {
        toast({
          title: 'Upload complete',
          description: `${task.file.name} uploaded successfully.`,
        });
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
  }, [uploads, toast]);

  const pendingCount = selectedFiles.length;
  const activeUploads = useMemo(
    () => uploads.filter((task) => task.status === 'uploading' || task.status === 'queued'),
    [uploads]
  );

  const completedUploads = useMemo(
    () => uploads.filter((task) => task.status === 'success'),
    [uploads]
  );

  const failedUploads = useMemo(
    () => uploads.filter((task) => task.status === 'error' || task.status === 'canceled'),
    [uploads]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="w-full flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Document Upload & Processing</h1>
          <p className="text-muted-foreground">
            Upload technical documents, drawings, specifications, and media files for AI analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={resetUploads}
            disabled={!uploads.length}
          >
            <Trash2 className="w-4 h-4" />
            Clear history
          </Button>
          <Button
            variant="default"
            size="lg"
            className="gap-2 px-6 py-3 text-base font-semibold shadow-md"
            onClick={handleUpload}
            disabled={isUploading || !selectedFiles.length}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Streaming uploads...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Upload {pendingCount ? `(${pendingCount})` : ''}
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
              <p className="text-sm text-muted-foreground mt-2">Maximum file size: 100MB per file</p>
            </div>
            <Button variant="outline" onClick={open} disabled={isUploading}>
              Browse Files
            </Button>
          </div>
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ready to upload</h3>
              <p className="text-sm text-muted-foreground">
                These files are staged and will start streaming once you click Upload.
              </p>
            </div>
            <Badge variant="secondary">{selectedFiles.length} selected</Badge>
          </div>
          <div className="grid gap-3">
            {selectedFiles.map(({ id, file }) => {
              const category = getFileCategory(file.type);
              const Icon = getFileIcon(category);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} · {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePendingFile(id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {uploads.length > 0 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Upload activity</h3>
            <p className="text-sm text-muted-foreground">
              Monitor streaming progress, cancel in-flight uploads, or clear completed entries.
            </p>
          </div>

          <div className="space-y-4">
            {uploads.map((task) => {
              const { label, badgeVariant, icon: StatusIcon } = statusConfig[task.status];
              const category = getFileCategory(task.file.type);
              const FileIcon = getFileIcon(category);
              const canCancel = task.status === 'uploading' || task.status === 'queued';
              const canRemove = task.status === 'success' || task.status === 'error' || task.status === 'canceled';

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{task.file.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {formatFileSize(task.file.size)} · {task.messageType.toLowerCase()} · {task.file.type || 'unknown type'}
                      </p>
                      </div>
                    </div>
                    <Badge variant={badgeVariant} className="flex items-center gap-1">
                      <StatusIcon className={`w-3 h-3 ${task.status === 'uploading' ? 'animate-spin' : ''}`} />
                      {label}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Progress value={task.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.progress}% completed</span>
                      {task.error && <span className="text-destructive">{task.error}</span>}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelUpload(task.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    )}
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(task.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="font-medium text-foreground">Active</p>
              <p>{activeUploads.length} in progress</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="font-medium text-foreground">Completed</p>
              <p>{completedUploads.length} finished</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="font-medium text-foreground">Needs attention</p>
              <p>{failedUploads.length} with issues</p>
            </div>
          </div>
        </Card>
      )}

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
