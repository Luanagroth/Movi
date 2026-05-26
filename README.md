# 🚍 MOVI — Plataforma de Mobilidade Urbana

Plataforma pública de mobilidade urbana para São Francisco do Sul e região, com foco em consulta de linhas, horários, paradas, rotas e modais hidroviários.

O projeto organiza dados públicos em uma experiência moderna, simples e acessível para facilitar o uso do transporte no dia a dia.

---

## 🌐 Deploy

🔗 Frontend Online: https://movi-frontend.vercel.app/

---

## 🚀 Status do Projeto

✅ Frontend e backend integrados  
✅ Dados reais carregados no fluxo principal  
✅ Mapa interativo com linhas e paradas  
✅ Sistema de autenticação  
✅ Favoritos por usuário  
✅ Recuperação de senha por e-mail  
✅ Estrutura PWA ativa  
✅ Build, lint e testes funcionando  

---

# 📌 Sobre o Projeto

## 🎯 Propósito

O MOVI nasceu para centralizar informações públicas de mobilidade urbana que normalmente ficam espalhadas entre:

- sites
- imagens
- PDFs
- redes sociais
- comunicados públicos

A proposta é transformar essas informações em uma experiência rápida, organizada e acessível.

---

# ⚠️ Problemas que o projeto busca resolver

- Dificuldade de encontrar horários e rotas rapidamente
- Falta de visualização clara por linha, sentido e paradas
- Baixa previsibilidade para quem depende de transporte público
- Experiência ruim em dispositivos móveis
- Informações espalhadas em múltiplas fontes

---

# 🧠 Motivação

Este projeto foi criado para:

- Consolidar dados públicos em uma experiência funcional
- Construir um produto completo de ponta a ponta
- Evoluir habilidades práticas em:
  - arquitetura
  - frontend
  - backend
  - UX/UI
  - dados
  - PWA
  - organização de monorepo

---

# 🛠️ Principais Desafios Técnicos

- Padronização de fontes de dados inconsistentes
- Relacionamento entre linhas, sentidos e paradas
- Controle de estados complexos no frontend
- Evitar chamadas inválidas e loops de renderização
- Garantir estabilidade sem perder velocidade de desenvolvimento
- Manter qualidade com lint, type-check, testes e build

---

# 🧱 Stack Utilizada

## 🎨 Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Leaflet
- React-Leaflet

---

## ⚙️ Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite

---

## 🧪 Qualidade e Testes

- Vitest
- Testing Library
- ESLint

---

# 📂 Estrutura do Monorepo

```bash
.
├─ apps/
│  ├─ backend/
│  └─ frontend/
├─ packages/
│  └─ shared/
├─ docs/
├─ scripts/
├─ package.json
└─ README.md
```

---

# ✨ Funcionalidades

## 🚏 Transporte

- Consulta de linhas e horários
- Visualização de trajetos no mapa
- Paradas por sentido
- Integração com ferry boat
- Página de bilhetes e tarifas

---

## 👤 Usuário

- Login e cadastro
- Perfil autenticado
- Favoritos por usuário
- Recuperação de senha via Brevo

---

## 🌎 Extras

- Página de notícias
- Página institucional de contato
- Widget de clima (Open-Meteo)
- Navegação responsiva
- Estrutura PWA

---

# 📱 PWA

## Implementações atuais

✅ manifest.webmanifest  
✅ Service Worker em produção  
✅ Cache de assets estáticos  
✅ Fallback offline básico  

> O app não depende de cache agressivo de dados dinâmicos de transporte.

---

# 💻 Como Rodar Localmente

## 📋 Pré-requisitos

- Node.js 20+
- npm 10+

---

## 📦 Instalação

```bash
npm install
```

---

## ▶️ Rodar projeto completo

```bash
npm run dev
```

O comando já executa automaticamente a preparação do banco local.

---

## 🔧 Rodar serviços separadamente

### Backend

```bash
npm run dev:backend
```

### Frontend

```bash
npm run dev:frontend
```

---

# 📜 Scripts Principais

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm run test
```

---

# 🔐 Variáveis de Ambiente

Arquivo principal:

```env
.env
```

## Exemplo mínimo:

```env
JWT_SECRET=troque-por-um-segredo-forte
APP_URL=http://localhost:3000

BREVO_API_KEY=sua-chave-brevo
BREVO_SENDER_EMAIL=seu-email
BREVO_SENDER_NAME=MOVI
```

> Em produção, altere `APP_URL` para a URL pública do deploy.

---

# 🗄️ Banco de Dados

O backend utiliza:

- Prisma ORM
- SQLite em ambiente de desenvolvimento

O fluxo recomendado é utilizar:

```bash
npm run dev
```

pois ele já prepara automaticamente o ambiente local.

---

# 🚀 Deploy

## Fluxo recomendado

1. Rodar validações locais
2. Subir alterações no GitHub
3. Realizar deploy do frontend na Vercel
4. Configurar backend conforme ambiente escolhido

---

## ✅ Checklist antes do deploy

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

---

# 📸 Capturas de Tela

## 🏠 Home

![Home do MOVI](docs/screenshots/home.png)

---

## 🗺️ Linhas e Horários

![Página de linhas e horários do MOVI](docs/screenshots/linhas%20e%20hor%C3%A1rios.png)

---

## 🎫 Bilhetes

![Página de bilhetes do MOVI - visão 1](docs/screenshots/bilhetes%201.0.png)

![Página de bilhetes do MOVI - visão 2](docs/screenshots/bilhetes%202.0.png)

---

## 📰 Notícias

![Página de notícias do MOVI](docs/screenshots/noticias.png)

---

# ⚠️ Aviso de Independência

O MOVI é um projeto independente e não possui vínculo oficial com:

- empresas operadoras
- órgãos governamentais
- entidades municipais

As informações exibidas são organizadas a partir de fontes públicas e podem sofrer alterações nas fontes originais.

---

# 👩‍💻 Desenvolvedora

## Luana Groth

🔗 LinkedIn: https://linkedin.com/in/luana-groth  
🔗 GitHub: https://github.com/Luanagroth  
🔗 Portfólio: https://luana-groth-portfolio.vercel.app/

---

# ©️ 2026 MOVI — Projetos Independentes
