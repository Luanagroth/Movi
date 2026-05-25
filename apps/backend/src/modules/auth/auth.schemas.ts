import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80).optional(),
  email: z.string().trim().toLowerCase().email('Informe um email válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um email válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export const saveLocationSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  label: z.string().trim().max(80).optional(),
});

const strongPasswordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'A senha deve conter pelo menos uma letra e um numero.');

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um email valido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, 'Token invalido.'),
  newPassword: strongPasswordSchema,
});
