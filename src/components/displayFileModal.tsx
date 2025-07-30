import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Eye, FileText } from 'lucide-react';
import { LibraryItem } from '@/utils/types';

interface DisplayFileModalProps {
  item: LibraryItem;
  download: (url:string,name:string)=>void
}

const DisplayFileModal: React.FC<DisplayFileModalProps> = ({ item,download }) => {
  const renderMedia = () => {
    if (item.type === 'video') {
      return (
        <video
          controls
          className="w-full max-h-96 rounded-md"
          poster={item.thumbnail}
          src={item.thumbnail}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (item.type === 'audio') {
      return (
        <audio controls className="w-full rounded-md" src={item.thumbnail}>
          Your browser does not support the audio element.
        </audio>
      );
    } else if (item.type === 'document') {
      if (item.thumbnail?.startsWith('data:image')) {
        return (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-full max-h-96 object-contain rounded-md"
          />
        );
      } else if (item.thumbnail?.startsWith('data:application')) {
        return (
          <div className="flex items-center justify-center w-full h-48 bg-gray-100 rounded-md text-gray-500">
            <iframe src={item.thumbnail} title="Document" className="w-full max-h-96" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Card className=" w-full sm:w-[400px] lg:w-[600px] mx-auto p-4">
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
          <Badge variant="secondary">{item.uploadedAt.toLocaleDateString()}</Badge>
        </div>
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={()=>download(item.thumbnail,item.name)}>
            {item.type === 'video' || item.type === 'audio' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-1 capitalize">download</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisplayFileModal;
