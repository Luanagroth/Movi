import { createHash, randomBytes } from 'node:crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';
import { prisma } from './shared/database/prisma.js';

const seededLineId = 'line-0100';
const seededOutboundDirectionId = `${seededLineId}-outbound`;
const seededInboundDirectionId = `${seededLineId}-inbound`;

describe('CityLine backend API', () => {
  it('retorna linhas com payload padronizado', async () => {
    const response = await request(app).get('/api/lines');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.meta.source).toBe('database');
    expect(response.body.meta.fallback).toBe(false);
  });

  it('permite busca textual por nome da linha', async () => {
    const response = await request(app).get('/api/search').query({ q: 'Praia' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.some((line: { name: string }) => line.name.includes('Praia'))).toBe(true);
  });

  it('retorna detalhes de rota e horarios a partir do banco', async () => {
    const lineResponse = await request(app).get(`/api/lines/${seededLineId}`);

    expect(lineResponse.status).toBe(200);
    expect(lineResponse.body.success).toBe(true);
    expect(lineResponse.body.data.stops.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.path.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.schedules.weekday.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.fareLabel).toContain('R$');

    const schedulesResponse = await request(app).get('/api/schedules').query({ lineId: seededLineId, dayType: 'weekday' });

    expect(schedulesResponse.status).toBe(200);
    expect(schedulesResponse.body.success).toBe(true);
    expect(schedulesResponse.body.meta.source).toBe('database');
    expect(Array.isArray(schedulesResponse.body.data.items)).toBe(true);
    expect(schedulesResponse.body.data.items.length).toBeGreaterThan(0);
  });

  it('mantem o endpoint de mapa compativel com path e paradas', async () => {
    const response = await request(app).get('/api/map/lines').query({ mode: 'urban' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.meta.source).toBe('database');
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].path.length).toBeGreaterThan(0);
    expect(response.body.data[0].stops.length).toBeGreaterThan(0);
  });

  it('expoe sentidos reais da linha sem quebrar a leitura atual', async () => {
    const directionsResponse = await request(app).get(`/api/lines/${seededLineId}/directions`);

    expect(directionsResponse.status).toBe(200);
    expect(directionsResponse.body.success).toBe(true);
    expect(directionsResponse.body.meta.source).toBe('database');
    expect(directionsResponse.body.data).toHaveLength(2);
    expect(directionsResponse.body.data[0].type).toBe('outbound');
    expect(directionsResponse.body.data[1].type).toBe('inbound');

    const stopsResponse = await request(app).get(`/api/lines/${seededLineId}/directions/${seededOutboundDirectionId}/stops`);

    expect(stopsResponse.status).toBe(200);
    expect(stopsResponse.body.data.items.length).toBeGreaterThan(0);
    expect(stopsResponse.body.data.direction.id).toBe(seededOutboundDirectionId);
  });

  it('retorna horarios e path por sentido com proximas partidas', async () => {
    const schedulesResponse = await request(app)
      .get(`/api/lines/${seededLineId}/directions/${seededOutboundDirectionId}/schedules`)
      .query({ dayType: 'weekday', at: '2026-03-30T06:19:00', limit: 2 });

    expect(schedulesResponse.status).toBe(200);
    expect(schedulesResponse.body.success).toBe(true);
    expect(schedulesResponse.body.data.items.length).toBeGreaterThan(0);
    expect(schedulesResponse.body.data.nextDepartures).toHaveLength(2);
    expect(schedulesResponse.body.data.nextDepartures[0].label).toBe('saida agora');

    const pathResponse = await request(app).get(`/api/lines/${seededLineId}/directions/${seededInboundDirectionId}/path`);

    expect(pathResponse.status).toBe(200);
    expect(pathResponse.body.success).toBe(true);
    expect(pathResponse.body.data.path.length).toBeGreaterThan(0);
    expect(pathResponse.body.data.direction.type).toBe('inbound');
  });

  it('cria sessao e retorna o perfil autenticado', async () => {
    const email = `cityline+${Date.now()}@example.com`;

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Luana Teste',
      email,
      password: '123456',
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.token).toBeTypeOf('string');

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data.email).toBe(email);
  });

  it('persiste favoritos por usuario autenticado sem bloquear o modo publico', async () => {
    const email = `favorites+${Date.now()}@example.com`;
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Favoritos Teste',
      email,
      password: '123456',
    });

    const linesResponse = await request(app).get('/api/lines');
    const lineId = linesResponse.body.data[0]?.id;

    expect(lineId).toBeTruthy();

    const createResponse = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`)
      .send({ lineId });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.lineId).toBe(lineId);

    const favoritesResponse = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`);

    expect(favoritesResponse.status).toBe(200);
    expect(favoritesResponse.body.success).toBe(true);
    expect(favoritesResponse.body.data.some((item: { lineId: string }) => item.lineId === lineId)).toBe(true);
  });

  it('responde com mensagem segura no fluxo de esqueci minha senha', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({
      email: 'naoexiste@example.com',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toContain('Se este e-mail estiver cadastrado');
  });

  it('redefine senha com token valido e invalida o reuso', async () => {
    const email = `reset+${Date.now()}@example.com`;
    const oldPassword = 'abc12345';
    const newPassword = 'nova1234';

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Reset Teste',
      email,
      password: oldPassword,
    });

    expect(registerResponse.status).toBe(201);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    expect(user?.id).toBeTruthy();

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user!.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      },
    });

    const resetResponse = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      newPassword,
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);

    const oldLogin = await request(app).post('/api/auth/login').send({
      email,
      password: oldPassword,
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post('/api/auth/login').send({
      email,
      password: newPassword,
    });
    expect(newLogin.status).toBe(200);

    const reuseResponse = await request(app).post('/api/auth/reset-password').send({
      token: rawToken,
      newPassword: 'reuse1234',
    });

    expect(reuseResponse.status).toBe(400);
  });
});

