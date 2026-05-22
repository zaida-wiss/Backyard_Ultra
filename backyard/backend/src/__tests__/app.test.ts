import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";

import app from "../app";

let server: Server;
let baseUrl: string;

function request(path: string, options: RequestInit = {}) {
  const { headers, ...rest } = options;

  return fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

describe('competition backend flow', () => {
  before(async () => {
    server = await new Promise((resolve, reject) => {
      const testServer = app.listen(0, '127.0.0.1');
      testServer.once('listening', () => resolve(testServer));
      testServer.once('error', reject);
    });
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Testservern startade utan port");
    }

    const { port } = address;
    baseUrl = `http://localhost:${port}`;
  });

  after(() => {
    server.close();
  });

  it('lets an organizer log in, create a competition and register a runner', async () => {
    const loginResponse = await request('/api/v1/organizers/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'arrangor@example.com',
        password: 'password123',
      }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.ok(loginBody.token);

    const competitionResponse = await request('/api/v1/competitions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
      body: JSON.stringify({
        name: 'Test Backyard',
        type: 'Backyard Ultra',
        place: 'Stockholm',
        startAt: '2026-08-01T09:00',
        endAt: '2026-08-02T17:00',
      }),
    });

    assert.equal(competitionResponse.status, 201);
    const competition = await competitionResponse.json();
    assert.equal(competition.place, 'Stockholm');
    assert.equal(competition.startAt, '2026-08-01T09:00');

    const runnerResponse = await request(`/api/v1/competitions/${competition.id}/runners`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
      body: JSON.stringify({
        firstName: 'Zaid',
        lastName: 'Awiss',
        email: 'zaid@example.com',
        club: 'Backyard Runners',
      }),
    });

    assert.equal(runnerResponse.status, 201);
    const runner = await runnerResponse.json();
    assert.equal(runner.competitionId, competition.id);
    assert.equal(runner.firstName, 'Zaid');
  });

  it('returns a clear validation error when competition times are missing', async () => {
    const loginResponse = await request('/api/v1/organizers/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'arrangor@example.com',
        password: 'password123',
      }),
    });
    const loginBody = await loginResponse.json();

    const response = await request('/api/v1/competitions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
      body: JSON.stringify({
        name: 'Trasig tävling',
        type: 'Backyard Ultra',
        place: 'Göteborg',
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, 'BAD_REQUEST');
  });

  it('can filter competitions by date, type, organizer and place', async () => {
    const response = await request('/api/v1/competitions?date=2026-06-13&type=backyard&organizerId=1&place=ume');

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].name, 'Skogsgläntans Backyard Ultra');
  });

  it('lets a runner create an account, log in and register for a competition', async () => {
    const registerResponse = await request('/api/v1/runners/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Sara',
        lastName: 'Lind',
        email: 'sara@example.com',
        password: 'password123',
        club: 'Skogslöparna',
      }),
    });

    assert.equal(registerResponse.status, 201);

    const loginResponse = await request('/api/v1/runners/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'sara@example.com',
        password: 'password123',
      }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.ok(loginBody.token);

    const registrationResponse = await request('/api/v1/competitions/1/runners/me', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    });

    assert.equal(registrationResponse.status, 201);
    const registration = await registrationResponse.json();
    assert.equal(registration.competitionId, 1);
    assert.equal(registration.email, 'sara@example.com');
  });
});
