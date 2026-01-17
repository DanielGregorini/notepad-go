import { WebSocket } from "ws";

export type RoomId = string;

export interface ClientMessage {
  type: "join" | "text-change";
  roomId: string;
  content?: string;
  token?: string;
}


export interface ClientMessageJoin {
  type: "join";
  roomId: RoomId;
}

export interface ClientMessageTextChange {
  type: "text-change";
  roomId: RoomId;
  content: string;
  token: string;
}


export interface ServerMessageReceiveChange {
  type: "receive-change";
  content: string;
}

export type ServerMessage = ServerMessageReceiveChange;

export type RoomClients = Record<string, Set<WebSocket>>;
export type RoomContents = Record<string, string>;
