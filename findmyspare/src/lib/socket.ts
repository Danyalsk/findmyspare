"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken, useAuthStore } from "@/lib/store";

// Socket.io runs on the same port as the REST API (single-port deployment)
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: (cb) => cb({ token: getAccessToken() || "" }),
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    if (process.env.NODE_ENV !== "production") {
      socketInstance.on("connect", () => console.log("[socket] connected", socketInstance?.id));
      socketInstance.on("disconnect", (r) => console.log("[socket] disconnected", r));
      socketInstance.on("connect_error", (e) => console.warn("[socket] connect_error:", e.message));
    }
  }

  if (!socketInstance.connected && !socketInstance.active) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function useSocket(): Socket | null {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      return;
    }
    const s = getSocket();
    setSocket(s);
  }, [accessToken]);

  return socket;
}
