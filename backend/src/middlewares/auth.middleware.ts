import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger";
import { getHttpLogContext } from "../utils/log-context";

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn(
      {
        event: "authorization_failed",
        ...getHttpLogContext(req),
        status_code: 401,
        reason: "missing_token",
      },
      "Acceso rechazado por token requerido",
    );

    return res.status(401).json({
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    logger.warn(
      {
        event: "authorization_failed",
        ...getHttpLogContext(req),
        status_code: 401,
        reason: "invalid_token",
      },
      "Acceso rechazado por token invalido",
    );
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};
