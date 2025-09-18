export const handleDownload = (fileUrl: string | undefined, fileName: string) => {
  if (!fileUrl) {
    console.warn('No file URL provided for download');
    return;
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
