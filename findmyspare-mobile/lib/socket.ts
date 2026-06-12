import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import Constants from "expo-constants";
import { getAccessToken, useAuthStore } from "./store";

const SOCKET_URL: string =
  (Constants.expoConfig?.extra as { socketUrl?: string } | undefined)?.socketUrl ||
  "http://localhost:8000";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: (cb) => cb({ token: getAccessToken() || "" }),
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    if (__DEV__) {
      socketInstance.on("connect", () => console.log("[socket] connected"));
      socketInstance.on("disconnect", (r) => console.log("[socket] disconnected", r));
      socketInstance.on("connect_error", (e) => console.warn("[socket] err:", e.message));
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
    setSocket(getSocket());
  }, [accessToken]);

  return socket;
}
