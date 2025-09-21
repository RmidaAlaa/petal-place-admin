import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export interface AuthRequest<
  P extends Record<string, unknown> = Record<string, unknown>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends Record<string, unknown> = Record<string, unknown>
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // headers is on the Express Request type; ensure TS knows req is an Express request
  const authHeader = (req as Request).headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }


  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: unknown, decoded: unknown) => {
    if (err) return res.sendStatus(403);
    // JWT payload shape is expected to include userId, email, role
    const payload = decoded as { userId?: string; email?: string; role?: string };
    if (!payload || !payload.userId) return res.sendStatus(403);
    req.user = {
      id: payload.userId,
      email: payload.email || '',
      role: payload.role || 'customer',
    };
    next();
  });
};



export const requireRole = (roles: string | string[]) => {
  const rolesArr = Array.isArray(roles) ? roles : [roles];
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.sendStatus(401);
    if (!rolesArr.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireVendor = requireRole(['vendor', 'admin']);
export const requireCustomer = requireRole(['customer', 'vendor', 'admin']);
