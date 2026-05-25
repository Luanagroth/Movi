import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../../shared/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { signAuthToken } from '../../shared/auth/jwt.js';
import { env } from '../../config/env.js';
import { sendPasswordResetEmail } from '../../providers/email/brevo-email.provider.js';

interface AuthInput {
  email: string;
  password: string;
  name?: string;
}

class AuthService {
  private readonly resetTokenTtlMs = 30 * 60 * 1000;
  private readonly safeForgotPasswordMessage =
    'Se este e-mail estiver cadastrado, enviaremos instrucoes para redefinir sua senha.';

  async register(input: AuthInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'EMAIL_ALREADY_IN_USE', 'Já existe uma conta com este email.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(input: AuthInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.');
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!validPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos.');
    }

    return this.buildAuthResponse(user);
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
    }

    return user;
  }

  async saveLocation(userId: string, input: { latitude: number; longitude: number; label?: string }) {
    return prisma.savedLocation.create({
      data: {
        userId,
        label: input.label,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });
  }

  async listLocations(userId: string) {
    return prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async forgotPassword(input: { email: string }) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return { message: this.safeForgotPasswordMessage };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMs);

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const resetLink = `${env.APP_URL.replace(/\/$/, '')}/redefinir-senha?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        toName: user.name,
        resetLink,
      });
    } catch (error) {
      // Mantemos resposta segura e sem vazar estado de usuario/email.
      const message = error instanceof Error ? error.message : 'unknown email provider error';
      console.warn(`[auth] Password reset delivery failed: ${message}`);
    }

    return { message: this.safeForgotPasswordMessage };
  }

  async resetPassword(input: { token: string; newPassword: string }) {
    const tokenHash = this.hashResetToken(input.token);
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      throw new AppError(400, 'INVALID_OR_EXPIRED_TOKEN', 'Token invalido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
        data: { usedAt: now },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildAuthResponse(user: { id: string; email: string; name: string | null; createdAt: Date }) {
    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        name: user.name,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}

export const authService = new AuthService();
