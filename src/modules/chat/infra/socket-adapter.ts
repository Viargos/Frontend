import type { Socket } from 'socket.io-client';
import type { ChatMessageDto } from '@/modules/chat/dto/chat.dto';
import { io } from 'socket.io-client';

type SocketConnectOptions = {
  token?: string;
};

type SocketSendPayload = {
  conversationId: string;
  content: string;
  receiverId: string;
  tempId: string;
};

type SocketSendAck = {
  success: boolean;
  message?: ChatMessageDto;
  tempId?: string;
  id?: string;
  createdAt?: string;
  error?: string;
};

type SocketErrorPayload = {
  message?: string;
};

type SocketAckPayload = {
  tempId?: string;
  id: string;
  createdAt: string;
  message: ChatMessageDto;
};

type ChatSocket = Socket<{
  'error': (payload: SocketErrorPayload) => void;
  'messageSent': (payload: ChatMessageDto) => void;
  'message:ack': (payload: SocketAckPayload) => void;
  'message:new': (payload: ChatMessageDto) => void;
  'newMessage': (payload: ChatMessageDto) => void;
}, {
  'message:send': (
    payload: SocketSendPayload,
    callback: (ack: SocketSendAck) => void,
  ) => void;
  'conversation:join': (payload: { conversationId: string }) => void;
  'sendMessage': (
    payload: SocketSendPayload,
    callback: (ack: SocketSendAck) => void,
  ) => void;
}>;

const DEFAULT_WS_BASE_URL = 'http://localhost:3000';
const CONNECTION_TIMEOUT_MS = 10_000;
const NAMESPACE_PATH = '/chat';
const SEND_TIMEOUT_MS = 10_000;

let connectionPromise: Promise<ChatSocket> | null = null;
let socketRef: ChatSocket | null = null;

function logSocketDebug(event: string, payload?: unknown): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.warn(`[chat-socket] ${event}`, payload ?? '');
}

function getSocketBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (!value) {
    return DEFAULT_WS_BASE_URL;
  }
  return value.replace(/\/+$/, '');
}

function getSocketNamespaceUrl(): string {
  return `${getSocketBaseUrl()}${NAMESPACE_PATH}`;
}

function buildSocketClient(options?: SocketConnectOptions): ChatSocket {
  return io(getSocketNamespaceUrl(), {
    auth: options?.token ? { token: options.token } : undefined,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
}

function ensureConnectedSocket(options?: SocketConnectOptions): Promise<ChatSocket> {
  if (socketRef?.connected) {
    return Promise.resolve(socketRef);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise<ChatSocket>((resolve, reject) => {
    const socket = socketRef ?? buildSocketClient(options);
    socketRef = socket;

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Socket connection timed out'));
    }, CONNECTION_TIMEOUT_MS);

    function cleanup() {
      window.clearTimeout(timeoutId);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      connectionPromise = null;
    }

    function handleConnect() {
      cleanup();
      resolve(socket);
    }

    function handleConnectError() {
      cleanup();
      reject(new Error('Socket connection failed'));
    }

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }
  });

  return connectionPromise;
}

export async function connectSocket(options?: SocketConnectOptions): Promise<void> {
  await ensureConnectedSocket(options);
}

export function disconnectSocket(): void {
  if (!socketRef) {
    return;
  }

  socketRef.removeAllListeners();
  socketRef.disconnect();
  socketRef = null;
  connectionPromise = null;
}

export function joinConversation(conversationId: string): void {
  if (!socketRef || !socketRef.connected) {
    return;
  }

  socketRef.emit('conversation:join', { conversationId });
}

export async function sendMessage(payload: SocketSendPayload): Promise<ChatMessageDto> {
  const socket = await ensureConnectedSocket();
  logSocketDebug('emit message:send', payload);

  return new Promise<ChatMessageDto>((resolve, reject) => {
    let timeoutId: number | null = null;

    const handleDisconnect = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      reject(new Error('Socket disconnected before delivery confirmation'));
    };

    timeoutId = window.setTimeout(() => {
      socket.off('disconnect', handleDisconnect);
      logSocketDebug('ack timeout', payload);
      reject(new Error('Message send timed out'));
    }, SEND_TIMEOUT_MS);

    socket.on('disconnect', handleDisconnect);

    socket.emit('message:send', payload, (ack: SocketSendAck) => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      socket.off('disconnect', handleDisconnect);

      if (!ack.success || !ack.message) {
        logSocketDebug('ack failed', ack);
        reject(new Error(ack.error ?? 'Message delivery failed'));
        return;
      }

      logSocketDebug('ack received', ack);
      resolve({
        ...ack.message,
        tempId: ack.tempId ?? ack.message.tempId ?? payload.tempId,
      });
    });
  });
}

export function subscribeToMessages(callback: (payload: ChatMessageDto) => void): () => void {
  const socket = socketRef;
  if (!socket) {
    return () => {};
  }

  socket.on('message:new', callback);
  return () => {
    socket.off('message:new', callback);
  };
}

export function subscribeToDelivery(callback: (payload: ChatMessageDto) => void): () => void {
  const socket = socketRef;
  if (!socket) {
    return () => {};
  }

  const handler = (payload: SocketAckPayload) => {
    callback({
      ...payload.message,
      tempId: payload.tempId,
    });
  };

  socket.on('message:ack', handler);
  return () => {
    socket.off('message:ack', handler);
  };
}

export function subscribeToSocketErrors(callback: (message: string) => void): () => void {
  const socket = socketRef;
  if (!socket) {
    return () => {};
  }

  const handler = (payload: SocketErrorPayload) => {
    callback(payload.message ?? 'Socket error');
  };

  socket.on('error', handler);
  return () => {
    socket.off('error', handler);
  };
}
