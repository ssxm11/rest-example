import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { RegisterBody, LoginBody } from "../middlewares/validate.middleware";
import { logger } from "../config/logger";
import { getHttpLogContext } from "../utils/log-context";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as RegisterBody;

    const user = await registerUser(body);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user,
    });
  } catch (error) {
    const err = error as Error & { statusCode?: number };

    // Error controlado desde el servicio (ej: email duplicado → 409)
    if (err.statusCode) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    logger.error(
      {
        event: "register_error",
        ...getHttpLogContext(req),
        status_code: 500,
        err,
      },
      "Error inesperado durante registro",
    );
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as LoginBody;

    const { token, user } = await loginUser(body);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true, // No accesible desde JS (previene XSS)
      secure: isProduction, // Solo HTTPS en producción
      sameSite: isProduction ? "none" : "lax", // "none" necesario para CORS en prod
      maxAge: 2 * 60 * 60 * 1000, // 2 horas en ms (igual que el JWT)
      path: "/",
    });

    res.status(200).json({
      token: token,
      message: "Login exitoso",
      user,
    });
  } catch (error) {
    const err = error as Error & { statusCode?: number; reason?: string };

    if (err.statusCode) {
      logger.warn(
        {
          event: "login_failed",
          ...getHttpLogContext(req),
          email: (req.body as Partial<LoginBody>).email?.toLowerCase(),
          status_code: err.statusCode,
          reason: err.reason ?? "controlled_error",
        },
        "Intento de autenticacion fallido",
      );
      res.status(err.statusCode).json({ message: err.message });
      return;
    }

    logger.error(
      {
        event: "login_error",
        ...getHttpLogContext(req),
        email: (req.body as Partial<LoginBody>).email?.toLowerCase(),
        status_code: 500,
        err,
      },
      "Error inesperado durante login",
    );
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
