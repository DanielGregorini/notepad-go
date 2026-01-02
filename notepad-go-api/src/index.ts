import "dotenv/config";
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
//import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());

//const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "HTTP route working ✅" });
});

// teste Prisma + Mongo: cria uma nota e devolve

/*
app.get("/prisma-test", async (req, res) => {
  try {

    const note = await prisma.note.create({
      data: { title: "Hello Prisma", content: "MongoDB connected ✅" },
    });
    res.json({ ok: true, created: note });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

*/

const server = http.createServer(app);

// WS preso no path /socket
const wss = new WebSocketServer({ noServer: true });

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

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", message: "WS connected " }));

  ws.on("message", (data) => {
    const text = data.toString();
    ws.send(JSON.stringify({ type: "echo", received: text }));
  });
});

const port = Number(process.env.PORT || 5000);
server.listen(port, () => {
  console.log(`HTTP:   http://localhost:${port}/`);
  console.log(`WS:     ws://localhost:${port}/socket`);
  //console.log(`Prisma: http://localhost:${port}/prisma-test`);
});
