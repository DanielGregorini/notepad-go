import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

import type {
  ClientMessage,
  RoomClients,
  RoomContents,
} from "./model/roomTypes";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// salas: { salaId: Set<WebSocket> }
const rooms: RoomClients = {};
// conteúdo por sala
const roomsContent: RoomContents = {};

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);

  if (url.pathname !== "/socket") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws: WebSocket) => {
  let currentRoom: string | null = null;

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString()) as ClientMessage;

    // Entrar na sala
    if (msg.type === "join") {
      const roomId = msg.roomId;
      currentRoom = roomId;

      if (!rooms[roomId]) rooms[roomId] = new Set();
      rooms[roomId].add(ws);

      console.log(`Usuário entrou na sala: ${roomId}`);
      logStatus();

      // manda conteúdo atual se existir
      if (roomsContent[roomId]) {
        ws.send(
          JSON.stringify({
            type: "receive-change",
            content: roomsContent[roomId],
          })
        );
      }
      return;
    }

    // Texto mudou
    if (msg.type === "text-change" && currentRoom) {
      const { content } = msg;
      roomsContent[currentRoom] = content;

      for (const client of rooms[currentRoom]) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "receive-change",
              content,
            })
          );
        }
      }
    }
  });

  // Fecha a conexão
  ws.on("close", () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].delete(ws);
      console.log(`Usuário saiu da sala: ${currentRoom}`);

      if (rooms[currentRoom].size === 0 && !roomsContent[currentRoom]) {
        delete rooms[currentRoom];
        delete roomsContent[currentRoom];
        console.log(`Sala removida: ${currentRoom}`);
      }

      logStatus();
    }
  });
});

function logStatus() {
  console.log("====== STATUS ======");
  const roomIds = Object.keys(rooms);
  console.log("Salas ativas:", roomIds.length);
  for (const roomId of roomIds) {
    console.log(`Sala ${roomId}: ${rooms[roomId].size} usuários`);
    //console.log(`Conteúdo: "${roomsContent[roomId] ?? ""}"`);
  }
  console.log("====================");
}

server.listen(5001, () => {
  console.log("HTTP: http://localhost:5001");
  console.log("WS:   ws://localhost:5001/socket");
});
