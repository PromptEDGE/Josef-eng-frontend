import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { getProjectDetails, ProjectHistoryEntry } from "@/api/project";
import { appendProjectMessage, setProjectChat, setProjectDetail } from "@/lib/redux/slice/projectDetailSlice";
import { RootState } from "@/lib/redux/store";
import { Message } from "@/utils/types";

const mapHistoryToMessages = (history: ProjectHistoryEntry[]): Message[] => {
  return history.map((entry, index) => {
    const type = entry.role === "assistant" ? "assistant" : entry.role === "system" ? "system" : "user";
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const text = typeof entry.content === "string" ? entry.content : JSON.stringify(entry.content);
    return {
      id: entry.id ?? `${type}-${index}-${Date.now()}`,
      type,
      content: {
        text,
      },
      timestamp,
    };
  });
};

const useProjectChat = (projectId: string | undefined) => {
  const dispatch = useDispatch();
  const normalizedId = projectId?.toLowerCase() ?? "";

  const projectDetail = useSelector((state: RootState) =>
    normalizedId ? state.projectDetail.details[normalizedId] : undefined
  );
  const messages = useSelector((state: RootState) =>
    normalizedId ? state.projectDetail.chats[normalizedId] : undefined
  );

  const messagesRef = useRef<Message[]>(messages ?? []);

  useEffect(() => {
    messagesRef.current = messages ?? [];
  }, [messages]);

  const query = useQuery({
    queryKey: ["project-detail", normalizedId],
    queryFn: () => {
      if (!projectId) {
        return Promise.reject(new Error("Missing project id"));
      }
      return getProjectDetails(projectId);
    },
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.data || !projectId) {
      return;
    }

    const { project, chat_history } = query.data;
    const lowerId = projectId.toLowerCase();
    const historyMessages = mapHistoryToMessages(chat_history);
    const existing = messagesRef.current ?? [];
    const knownIds = new Set(historyMessages.map((msg) => msg.id));
    // const merged = [...historyMessages];
    // existing.forEach((msg) => {
    //   if (!knownIds.has(msg.id)) {
    //     merged.push(msg);
    //   }
    // });

    dispatch(setProjectDetail({ projectId: lowerId, detail: { ...project, id: project.id } }));
    dispatch(setProjectChat({ projectId: lowerId, messages: historyMessages }));
  }, [dispatch, query.data, projectId]);

  const hasMessages = Boolean(messages && messages.length);

  return {
    project: projectDetail,
    messages: messages ?? [],
    isLoading: query.isLoading && !hasMessages,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    appendMessage: (message: Message) => {
      if (!normalizedId) return;
      dispatch(appendProjectMessage({ projectId: normalizedId, message: { ...message, id: message.id ?? uuidv4() } }));
    },
  };
};

export default useProjectChat;
