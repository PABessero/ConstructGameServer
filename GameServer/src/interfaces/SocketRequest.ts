export interface SocketRequest {
  data: Object;
  RequestType: RequestTypes;
}

export type RequestTypes = "create" | "delete" | "position" | "message";
