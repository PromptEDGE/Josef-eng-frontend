import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Eye, FileText, X } from 'lucide-react';
import { LibraryItem } from '@/utils/types';

interface DisplayFileModalProps {
  item: LibraryItem;
  download: (url:string,name:string)=>void,
  cancel: (item:LibraryItem|null)=>void,
}

const DisplayFileModal: React.FC<DisplayFileModalProps> = ({ item,download,cancel }) => {
  const mediaSource = item.thumbnail ?? item.downloadUrl;

  const renderMedia = () => {
    if (item.type === 'video') {
      return (
        <video
          controls
          className="w-full max-h-96 rounded-md"
          poster={mediaSource}
          src={mediaSource}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (item.type === 'audio') {
      return (
        <audio controls className="w-full rounded-md" src={mediaSource}>
          Your browser does not support the audio element.
        </audio>
      );
    } else if (item.type === 'document') {
      if (mediaSource?.startsWith('data:image') || mediaSource?.endsWith('.png') || mediaSource?.endsWith('.jpg')) {
        return (
          <img
            src={mediaSource}
            alt={item.name}
            className="w-full max-h-96 object-contain rounded-md"
          />
        );
      } else if (mediaSource?.startsWith('data:application') || mediaSource?.endsWith('.pdf')) {
        return (
          <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md text-gray-500">
            <iframe src={mediaSource} title="Document" className="w-full max-h-96" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Card className="relative w-full z-50 sm:w-[400px] lg:w-[600px] mx-auto p-4">
      <X onClick={()=>cancel(null)} className='cursor-pointer absolute right-5 top-5 ' />
      <CardHeader>
        <CardTitle className="text-xl">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderMedia()}
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{item.type}</Badge>
          <Badge variant="secondary">{item.size}</Badge>
          {item.duration && <Badge variant="secondary">{item.duration}</Badge>}
          <Badge variant="secondary">{new Date(item.uploadedAt).toLocaleDateString()}</Badge>
        </div>
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replace(/\b\w/g, (char) => char.toUpperCase())}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => item.downloadUrl && download(item.downloadUrl, item.name)}
            disabled={!item.downloadUrl}
          >
            {item.type === 'video' || item.type === 'audio' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-1 capitalize">download</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplayFileModal;
