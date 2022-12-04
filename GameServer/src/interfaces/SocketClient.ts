import { WebSocket } from "ws";
import { Player } from "./Player";

export interface SocketClient {
  clientID: string | string[];
  socket: WebSocket;
  player?: Player;
}
