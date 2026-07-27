import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "../lib/utils";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import type { Message } from "../lib/api";

export function useSocket(conversationId: string | null, onMessage: (msg: Message) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const token = api.getToken();
    if (!conversationId || !token || !user) return;

    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.emit("join", conversationId);

    socket.on("message", (msg: Message) => {
      onMessage(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, user, onMessage]);

  const sendMessage = (content: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("message", { conversationId, content });
    }
  };

  const sendTyping = () => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("typing", { conversationId });
    }
  };

  return { sendMessage, sendTyping };
}
