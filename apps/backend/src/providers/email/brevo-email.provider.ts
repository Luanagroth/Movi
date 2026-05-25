import { env } from '../../config/env.js';

interface SendPasswordResetEmailInput {
  toEmail: string;
  toName?: string | null;
  resetLink: string;
}

const BREVO_SEND_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function buildResetEmailHtml(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #14233c;">
      <h2 style="margin-bottom: 12px;">Redefinicao de senha do CityLine</h2>
      <p>Recebemos um pedido para redefinir sua senha.</p>
      <p>Use o link abaixo em ate 30 minutos:</p>
      <p style="margin: 18px 0;">
        <a href="${resetLink}" style="background:#17803e;color:#ffffff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;">
          Redefinir senha
        </a>
      </p>
      <p>Se voce nao solicitou essa alteracao, pode ignorar este email.</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput) {
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
    console.warn('[auth] Password reset email not sent: BREVO_API_KEY or EMAIL_FROM is not configured.');
    return { delivered: false as const, mocked: true as const };
  }

  const response = await fetch(BREVO_SEND_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        email: env.EMAIL_FROM,
        name: env.BREVO_SENDER_NAME ?? 'CityLine',
      },
      to: [
        {
          email: input.toEmail,
          name: input.toName ?? undefined,
        },
      ],
      subject: 'Redefinicao de senha - CityLine',
      htmlContent: buildResetEmailHtml(input.resetLink),
    }),
  });

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      details = null;
    }

    throw new Error(
      `Falha ao enviar email de recuperacao (Brevo status ${response.status}).${
        details ? ` Detalhes: ${JSON.stringify(details)}` : ''
      }`
    );
  }

  return { delivered: true as const, mocked: false as const };
}
