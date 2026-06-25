import { Request } from "express";

export interface HttpLogContext {
  request_id?: string;
  source_ip: string;
  user_agent: string;
  http_method: string;
  http_path: string;
}

export const getHttpLogContext = (req: Request): HttpLogContext => ({
  request_id: req.requestId,
  source_ip: req.ip ?? "unknown",
  user_agent: req.headers["user-agent"] ?? "unknown",
  http_method: req.method,
  http_path: req.originalUrl,
});
