import type { Request, Response, NextFunction } from 'express';

const errorHandlerMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const error = err as { status?: number; message?: string };
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
  });
};

export { errorHandlerMiddleware };
