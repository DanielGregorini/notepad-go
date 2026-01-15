import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

import { connectMongo } from "./db/monge";
import SlugRepository from "./repository/slug";
import RoomSyncJob from "./jobs/roomSyncJob";

import type {
  ClientMessage,
  RoomClients,
  RoomContents,
} from "./model/roomTypes";

// -------------------- Mongo --------------------
let slugRepository: SlugRepository;

async function initDB() {
  const db = await connectMongo();
  slugRepository = new SlugRepository(db);
}
initDB();

// -------------------- App --------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// -------------------- Estado em memória --------------------
const rooms: RoomClients = {};
const roomsContent: RoomContents = {};

// -------------------- Upgrade WS --------------------
server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);

  if (url.pathname !== "/socket") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws);
  });
});

// -------------------- WS --------------------
wss.on("connection", (ws: WebSocket) => {
  let currentRoom: string | null = null;


  ws.on("message", async (data) => {
    const msg = JSON.parse(data.toString()) as ClientMessage;

    // -------- JOIN --------
    if (msg.type === "join") {
      const slug = msg.roomId;
      currentRoom = slug;

      if (!rooms[slug]) {
        const saved = await slugRepository.findBySlug(slug);
        console.log("Saved slug:", saved);
        roomsContent[slug] = saved?.context ?? "";
        rooms[slug] = new Set();
      }

      rooms[slug].add(ws);

      ws.send(
        JSON.stringify({
          type: "receive-change",
          content: roomsContent[slug],
        })
      );

      logStatus();
      return;
    }

    // -------- TEXT CHANGE --------
    if (msg.type === "text-change" && currentRoom && currentRoom != undefined && msg.content !== undefined) {
  
      roomsContent[currentRoom] = msg.content;

      for (const client of rooms[currentRoom]) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "receive-change",
              content: msg.content,
            })
          );
        }
      }
    }
  });

  // -------- CLOSE --------
  ws.on("close", async () => {
    if (!currentRoom) return;

    rooms[currentRoom]?.delete(ws);

    // última conexão saiu da sala
    if (rooms[currentRoom]?.size === 0) {
      const content = roomsContent[currentRoom];

      // verifica se já existe no banco
      const exists = await slugRepository.exists(currentRoom);

      if (exists) {
        // atualiza
        await slugRepository.updateContext(currentRoom, content);
      } else {
        // cria
        await slugRepository.create({
          slug: currentRoom,
          context: content,
        });
      }

      delete rooms[currentRoom];
      delete roomsContent[currentRoom];
    }

    logStatus();
  });
});

// -------------------- Logs --------------------
function logStatus() {
  console.log("\n====== STATUS ======");
  for (const slug of Object.keys(rooms)) {
    console.log(`Sala ${slug}: ${rooms[slug].size} usuários`);
  }
  console.log("====================");
}

// -------------------- Job --------------------
const roomSyncJob = new RoomSyncJob(roomsContent, 30 * 1000);
roomSyncJob.start();

// -------------------- Server --------------------
server.listen(5001, () => {
  console.log("HTTP: http://localhost:5001");
  console.log("WS:   ws://localhost:5001/socket");
});
