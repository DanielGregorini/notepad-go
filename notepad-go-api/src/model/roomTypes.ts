
import { WebSocket } from "ws";

export type RoomId = string;

export interface ClientMessageJoin {
  type: "join";
  roomId: RoomId;
}

export interface ClientMessageTextChange {
  type: "text-change";
  roomId: RoomId;
  content: string;
}

export type ClientMessage = ClientMessageJoin | ClientMessageTextChange;

export interface ServerMessageReceiveChange {
  type: "receive-change";
  content: string;
}

export type ServerMessage = ServerMessageReceiveChange;

export type RoomClients = Record<RoomId, Set<WebSocket>>;

export type RoomContents = Record<RoomId, string>;
