import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import "dotenv/config";

import { connectMongo } from "./db/monge";
import RoomSyncJob from "./jobs/roomSyncJob";

import SlugRepository from "./repository/slug";
import UserRepository from "./repository/user";

import SlugJwt from "./auth/slugService";
import UserJwt from "./auth/userService";
import SlugRoutes from "./routes/slug";

import UserRoutes from "./routes/user";

import type {
  ClientMessage,
  RoomClients,
  RoomContents,
} from "./model/roomTypes";

const TIME_SYNC_ROOM_S = process.env.TIME_SYNC_ROOM_S ? parseInt(process.env.TIME_SYNC_ROOM_S) * 1000 : 30000;

async function bootstrap() {
  // -------------------- DB --------------------
  const db = await connectMongo();
  const slugRepository = new SlugRepository(db);
  const userRepository = new UserRepository(db);

  // -------------------- APP --------------------
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // -------------------- HTTP + WS --------------------
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  // -------------------- MEMÓRIA --------------------
  const rooms: RoomClients = {};
  const roomsContent: RoomContents = {};

  // -------------------- UPGRADE --------------------
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
    let canEdit = false;

    ws.on("message", async (data) => {
      let msg: ClientMessage;

      try {
        msg = JSON.parse(data.toString());
      } catch {
        ws.close();
        return;
      }

      // ---------------- JOIN ----------------
      if (msg.type === "join") {
        const { roomId, token } = msg;

        if (!roomId) {
          ws.close();
          return;
        }

        const savedSlug = await slugRepository.findBySlug(roomId);

        const passwordProtected = savedSlug?.passwordProtected === true;

        // slug tem senha → exige token
        if (passwordProtected) {
          if (!token) {
            ws.close();
            return;
          }

          const slugAllowed = SlugJwt.canEdit(token, roomId);
          //const userAllowed = UserJwt.canEdit(token);

          if (!slugAllowed) {
            ws.close();
            return;
          }

          canEdit = true;
        } else {
          canEdit = true;
        }

        currentRoom = roomId;

        if (!rooms[roomId]) {
          roomsContent[roomId] = savedSlug?.context ?? "";
          rooms[roomId] = new Set();
        }

        rooms[roomId].add(ws);

        ws.send(
          JSON.stringify({
            type: "receive-change",
            content: roomsContent[roomId],
          }),
        );

        logStatus();
        return;
      }

      // --------- BLOQUEIO ---------
      if (!canEdit || !currentRoom) {
        return;
      }

      // ---------------- TEXT CHANGE ----------------
      if (msg.type === "text-change" && msg.content !== undefined) {
        roomsContent[currentRoom] = msg.content;

        for (const client of rooms[currentRoom]) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "receive-change",
                content: msg.content,
              }),
            );
          }
        }
      }
    });

    // ---------------- CLOSE ----------------
    ws.on("close", async () => {
      if (!currentRoom) return;

      rooms[currentRoom]?.delete(ws);

      if (rooms[currentRoom]?.size === 0) {
        const content = roomsContent[currentRoom];
        const exists = await slugRepository.exists(currentRoom);

        if (exists) {
          await slugRepository.updateContext(currentRoom, content);
        } else {
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

  // -------------------- LOG --------------------
  function logStatus() {
    console.log("\n====== STATUS ======");
    for (const slug of Object.keys(rooms)) {
      console.log(`Sala ${slug}: ${rooms[slug].size} usuários`);
    }
    console.log("====================");
  }

  // -------------------- JOB --------------------
  const roomSyncJob = new RoomSyncJob(roomsContent, TIME_SYNC_ROOM_S);
  roomSyncJob.start();

  app.use("/slug", SlugRoutes(slugRepository));

  app.use("/user", UserRoutes(userRepository, slugRepository));

  // -------------------- SERVER --------------------
  server.listen(5001, () => {
    console.log("HTTP: http://localhost:5001");
    console.log("WS:   ws://localhost:5001/socket");
    console.log("\n");
  });
}

bootstrap().catch((err) => {
  console.error("Erro ao iniciar:", err);
  process.exit(1);
});
