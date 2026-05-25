# CityLine Auth

## Recuperacao de senha

O CityLine possui fluxo de "Esqueci minha senha" com envio de email transacional via Brevo.

### Endpoints

- `POST /api/auth/forgot-password`
  - Entrada: `{ "email": "usuario@exemplo.com" }`
  - Resposta segura (sempre):  
    `Se este e-mail estiver cadastrado, enviaremos instrucoes para redefinir sua senha.`
  - Nao informa se o email existe ou nao.

- `POST /api/auth/reset-password`
  - Entrada: `{ "token": "...", "newPassword": "..." }`
  - Regras:
    - token expira em 30 minutos;
    - token e de uso unico;
    - senha nova precisa ter no minimo 8 caracteres, com letra e numero.

### Banco de dados

Tabela/model `PasswordResetToken`:

- `id`
- `userId`
- `tokenHash` (somente hash, nunca token puro)
- `expiresAt`
- `usedAt`
- `createdAt`

## Variaveis de ambiente

No backend:

```env
BREVO_API_KEY=
EMAIL_FROM=
APP_URL=http://localhost:3000
```

Em producao:

```env
APP_URL=https://seudominio.com
```

## Brevo

O envio e feito por provider isolado em:

- `apps/backend/src/providers/email/brevo-email.provider.ts`

Funcao principal:

- `sendPasswordResetEmail(toEmail, resetLink)`

## Comportamento em desenvolvimento

Se `BREVO_API_KEY` ou `EMAIL_FROM` nao estiverem configurados, o backend entra em modo mock para envio de email:

- o app nao quebra;
- o endpoint de `forgot-password` continua respondendo com mensagem segura;
- nenhum segredo e exposto no frontend.

## Frontend

Paginas:

- `/esqueci-senha`
- `/redefinir-senha?token=...`

Fluxo:

1. Usuario solicita recuperacao por email;
2. recebe link de redefinicao;
3. define nova senha e confirma;
4. volta ao login com senha atualizada.

