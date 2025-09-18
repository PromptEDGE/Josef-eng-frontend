export const getType = (mime: string): 'video' | 'audio' | 'document' => {
      if (mime.startsWith('video')) return 'video';
      if (mime.startsWith('audio')) return 'audio';
      return 'document';
    };