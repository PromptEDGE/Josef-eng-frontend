import { useEffect, useState } from 'react';
import {motion,AnimatePresence} from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Upload, 
  Filter, 
  Grid, 
  List, 
  Play,
  Download,
  Eye,
  Video,
  Mic,
  FileText,
  Calendar,
  Clock,
  File,
  X
} from 'lucide-react';
import { LibraryItem } from '@/utils/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import DisplayFileModal from '@/components/displayFileModal';
import { handleDownload } from '@/utils/handleDownload';



export default function LibraryPage() {
  const library = useSelector((state:RootState)=>state.library.library)
  const [libraryItems,setLibraryItems] = useState<LibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile,setSelectedFile] = useState<LibraryItem|null>(null)
  
  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||  item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesType && matchesTab;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Mic;
      case 'document': return FileText;
      default: return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'audio': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'document': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const selectedItem = (select: LibraryItem)=>{
    console.log(select)
    setSelectedFile(select)
  }

  const ItemCard = ({ item }: { item: LibraryItem }) => {
    const TypeIcon = getTypeIcon(item.type);
    
    return (
      <Card className="hover:shadow-lg transition-shadow relative ">
        <CardHeader className="pb-3 w-full ">
          <div className="w-full flex flex-wrap gap-1 items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1 w-full">
                <CardTitle className="block text-base w-full line-clamp-1">{item.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.size}</span>
                  {item.duration && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button onClick={()=>selectedItem(item)}  variant="outline" size="sm">
                {item.type === 'video' ? <Play className="w-4 h-4" /> : 
                 item.type === 'audio' ? <Play className="w-4 h-4" /> : 
                 <Eye className="w-4 h-4" />}
              </Button>
              <Button onClick={()=>handleDownload(item.thumbnail,item.type)} variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {item.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {/* <span>By {item.uploadedBy}</span> */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.uploadedAt.toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ItemRow = ({ item }: { item: LibraryItem }) => {
    const TypeIcon = getTypeIcon(item.type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{item.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{item.size}</span>
                  {item.duration && <span>{item.duration}</span>}
                  {/* <span>By {item.uploadedBy}</span> */}
                  <span>{item.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm">
                {item.type === 'video' ? <Play className="w-4 h-4" /> : 
                 item.type === 'audio' ? <Play className="w-4 h-4" /> : 
                 <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  useEffect(()=>{
    setLibraryItems(library)
  },[library])
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Library</h1>
            <p className="text-muted-foreground">
              Manage videos, audio recordings, and documents for your projects.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search library files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No files found</p>
                  <p className="text-sm">Upload files or adjust your search criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <AnimatePresence>
        {selectedFile&&
        <motion.div
          initial={{opacity: 0,scale: 0.9}}
          animate={{opacity: 1,scale: 1}}
          exit={{opacity: 0,scale: 0.9}}
        className="w-full h-dvh bg-white/80 flex items-center justify-center fixed inset-0 ">
          <X onClick={()=>setSelectedFile(null)} className='cursor-pointer absolute right-5 top-5 ' />
          <DisplayFileModal download={handleDownload} item={selectedFile} />
        </motion.div>
        }
      </AnimatePresence>
    </div>
  );
}