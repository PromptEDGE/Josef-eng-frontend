import { listDocuments, DocumentRecord } from "@/api/documents";
import {  getAllLibrary } from "@/lib/redux/slice/librarySlice";
import { LibraryItem } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

const useGetLibrary = () => {
    const dispatch = useDispatch()
    const backendUrl = useMemo(() => {
        const url = import.meta.env.VITE_BACKEND_URL as string | undefined;
        if (!url) return "";
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }, []);

    const toAbsoluteUrl = (path?: string | null) => {
        if (!path) return undefined;
        if (/^https?:\/\//i.test(path)) return path;
        if (!backendUrl) return path;
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${backendUrl}${normalizedPath}`;
    };

    const mapDocumentToLibraryItem = (doc: DocumentRecord): LibraryItem => {
        const contentType = doc.content_type || "";
        const normalizedType = contentType.startsWith("video")
            ? "video"
            : contentType.startsWith("audio")
            ? "audio"
            : "document";

        const sizeLabel = typeof doc.size_bytes === "number" && doc.size_bytes > 0
            ? formatFileSize(doc.size_bytes)
            : "Unknown size";

        const statusTag = doc.status
            ? [doc.status.replace(/_/g, ' ').toLowerCase()]
            : [];

        const downloadUrl = toAbsoluteUrl(doc.storage_path);

        return {
            id: doc.id,
            name: doc.filename,
            type: normalizedType,
            size: sizeLabel,
            uploadedAt: new Date(doc.created_at),
            tags: statusTag,
            thumbnail: downloadUrl,
            downloadUrl,
            projectId: doc.project_id ?? null,
            userId: doc.user_id ?? null,
            status: doc.status,
            storagePath: doc.storage_path ?? null,
            contentType: doc.content_type,
        };
    };

    const { data,refetch,isError,isSuccess,isLoading } = useQuery({
        queryKey: ['library-documents'],
        queryFn: () => listDocuments(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
    useEffect(()=>{
        if(data){
            const library: LibraryItem[] = data.map(mapDocumentToLibraryItem)
            // save to redux
            dispatch(getAllLibrary(library))
        }
    },[data,dispatch])
    return {
        data,
        refetch,
        isError,
        isSuccess,
        isLoading,
    };
}
const formatFileSize = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "Unknown size";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

export default useGetLibrary;
