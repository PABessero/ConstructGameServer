import { WebSocket, WebSocketServer } from "ws";
import "colors";
import * as url from "url";
import { Player } from "./interfaces/Player";
import { SocketClient } from "./interfaces/SocketClient";
import { SocketRequest } from "./interfaces/SocketRequest";

const wss = new WebSocketServer({ port: 5656 });
console.log("Creating server".green);

let clients: SocketClient[] = [];

wss.on("connection", on_connection);

function getUniqueId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4();
}

function on_connection(ws: WebSocket, req) {
  const parameters = url.parse(req.url, true);
  let player: Player = { id: "", x: 0, y: 0, z: 0, rotation: 0 };
  let broadcastMessage: SocketRequest;
  if (parameters.query.id) {
    player.id = parameters.query.id;
  } else {
    player.id = getUniqueId();
  }

  clients.push({ clientID: player.id, socket: ws, player: player });

  console.log(`New user connected with ID ${player.id}`);

  wss.clients.forEach((client) => {
    broadcastMessage = { data: player.id, RequestType: "message" };
    client.send(JSON.stringify(broadcastMessage));
  });

  clients.forEach((client) => {
    if (client.clientID != player.id) {
      broadcastMessage = { data: player, RequestType: "create" };
      client.socket.send(JSON.stringify(broadcastMessage));
      broadcastMessage = { data: client.player, RequestType: "create" };
      ws.send(JSON.stringify(broadcastMessage));
    }
  });

  ws.on("message", function incoming(message, isBinary) {
    // console.log(`${player.id}: ${message.toString()}`);
    const parsedMessage = JSON.parse(message.toString());
    switch (parsedMessage.RequestType) {
      case "Position":
        player.x = Number(parsedMessage.Position.X);
        player.y = Number(parsedMessage.Position.Y);
        player.rotation = Number(parsedMessage.Position.Rotation);
        broadcastMessage = { data: player, RequestType: "position" };
        clients.forEach((client) => {
          if (client.clientID != player.id) {
            client.socket.send(JSON.stringify(broadcastMessage));
          }
        });
    }
    clients.find((client) => {
      return client.player.id === player.id;
    }).player = player;
    // console.log(JSON.stringify(player).blue);
  });

  ws.on("close", function disconnected() {
    console.log(`Client ${player.id} disconnected`);
    broadcastMessage = { data: player, RequestType: "delete" };
    clients.forEach((client) => {
      client.socket.send(JSON.stringify(broadcastMessage));
    });
    clients = clients.filter((client) => {
      return client.player.id !== player.id;
    });
  });

  ws.on("disconnect", function () {
    console.log(`Client ${player.id} disconnecting`);
  });
}