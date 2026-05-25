import { Router, type Request, type RequestHandler, type Response } from 'express';
import { sendOk } from '../../shared/http/response.js';
import { optionalAuth, requireAuth, type AuthenticatedRequest } from '../../shared/auth/auth.middleware.js';
import { authService } from './auth.service.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, saveLocationSchema } from './auth.schemas.js';

const asyncHandler = (handler: RequestHandler): RequestHandler => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

export const authRouter = Router();

authRouter.post(
  '/auth/register',
  asyncHandler(async (request: Request, response: Response) => {
    const payload = registerSchema.parse(request.body);
    const result = await authService.register(payload);
    response.status(201).json({ success: true, data: result });
  })
);

authRouter.post(
  '/auth/login',
  asyncHandler(async (request: Request, response: Response) => {
    const payload = loginSchema.parse(request.body);
    const result = await authService.login(payload);
    sendOk(response, result, { source: 'fallback', fallback: false });
  })
);

authRouter.post(
  '/auth/forgot-password',
  asyncHandler(async (request: Request, response: Response) => {
    const payload = forgotPasswordSchema.parse(request.body);
    const result = await authService.forgotPassword(payload);
    sendOk(response, result, { source: 'fallback', fallback: false });
  })
);

authRouter.post(
  '/auth/reset-password',
  asyncHandler(async (request: Request, response: Response) => {
    const payload = resetPasswordSchema.parse(request.body);
    const result = await authService.resetPassword(payload);
    sendOk(response, result, { source: 'fallback', fallback: false });
  })
);

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const user = await authService.getCurrentUser((request as AuthenticatedRequest).authUser!.id);
    sendOk(response, user, { source: 'fallback', fallback: false });
  })
);

authRouter.get(
  '/auth/locations',
  requireAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const items = await authService.listLocations((request as AuthenticatedRequest).authUser!.id);
    sendOk(response, items, { source: 'fallback', fallback: false, count: items.length });
  })
);

authRouter.post(
  '/auth/locations',
  optionalAuth,
  asyncHandler(async (request: Request, response: Response) => {
    const user = (request as AuthenticatedRequest).authUser;
    if (!user) {
      sendOk(response, { saved: false, reason: 'Usuário não autenticado.' }, { source: 'fallback', fallback: false });
      return;
    }

    const payload = saveLocationSchema.parse(request.body);
    const item = await authService.saveLocation(user.id, payload);
    response.status(201).json({ success: true, data: item });
  })
);
