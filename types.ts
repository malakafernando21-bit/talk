export enum AppState {
  LOGIN = 'LOGIN',
  LOBBY = 'LOBBY',
  COMMUNICATING = 'COMMUNICATING',
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface User {
  id: string;
  name: string;
  channel: string;
  isMuted: boolean;
  isTalking: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'web';
  isCurrent: boolean;
  isMuted: boolean;
  status: 'online' | 'offline';
}

export interface AudioMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  duration: number;
  transcription?: string; // AI Enhanced
  audioBlob?: Blob; // Client-side simulation
  audioUrl?: string; // Server-side URL
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'system' | 'voice' | 'error';
  sender?: string;
  transcription?: string;
}

// For simulation
export const MOCK_CHANNEL = 'Squad-Alpha';