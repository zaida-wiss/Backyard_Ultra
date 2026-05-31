import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../app.js";
import { CompetitionModel } from "../models/competition.model.js";
import { RunnerModel } from "../models/runner.model.js";
import { UserModel } from "../models/user.model.js";
import { hashPassword } from "../utils/jwt.js";

let mongoServer: MongoMemoryServer;
let server: Server;
let baseUrl: string;
let seededOrganizerId: string;
let seededCompetitionId: string;

function request(path: string, options: RequestInit = {}) {
  const { headers, ...rest } = options;

  return fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function getSessionCookie(response: Response) {
  const setCookie = response.headers.get("set-cookie");

  assert.ok(setCookie);

  return setCookie.split(";")[0];
}

const closeServer = async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

describe("competition backend flow", () => {
  before(async () => {
    process.env.AUTH_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const organizer = await UserModel.create({
      firstName: "Backyard Ultra",
      lastName: "Sverige",
      email: "arrangor@example.com",
      organizerName: "Backyard Ultra Sverige",
      roles: ["user", "runner", "organizer"],
      passwordHash: await hashPassword("password123"),
    });
    seededOrganizerId = organizer.id;

    const competition = await CompetitionModel.create({
      organizerId: organizer._id,
      name: "Skogsgläntans Backyard Ultra",
      type: "Backyard Ultra",
      place: "Umeå",
      startAt: new Date("2026-06-13T10:00:00.000Z"),
      endAt: new Date("2026-06-14T18:00:00.000Z"),
    });
    seededCompetitionId = competition.id;

    server = await new Promise((resolve, reject) => {
      const testServer = app.listen(0, "127.0.0.1");
      testServer.once("listening", () => resolve(testServer));
      testServer.once("error", reject);
    });
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Testservern startade utan port");
    }

    const { port } = address;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    await closeServer();
    await RunnerModel.deleteMany({});
    await CompetitionModel.deleteMany({});
    await UserModel.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("lets an organizer log in, create a competition and register a runner", async () => {
    const loginResponse = await request("/api/v1/organizers/login", {
      method: "POST",
      body: JSON.stringify({
        email: "arrangor@example.com",
        password: "password123",
      }),
    });

    assert.equal(loginResponse.status, 200);
    const sessionCookie = getSessionCookie(loginResponse);

    const currentSessionResponse = await request("/api/v1/auth/me", {
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(currentSessionResponse.status, 200);
    const currentSession = await currentSessionResponse.json();
    assert.equal(currentSession.user.email, "arrangor@example.com");

    const competitionResponse = await request("/api/v1/competitions", {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        name: "Test Backyard",
        type: "Backyard Ultra",
        place: "Stockholm",
        startAt: "2026-08-01T09:00",
      }),
    });

    assert.equal(competitionResponse.status, 201);
    const competition = await competitionResponse.json();
    assert.equal(competition.place, "Stockholm");
    assert.equal(competition.startAt, "2026-08-01T09:00");
    assert.equal(competition.endAt, null);

    const runnerResponse = await request(`/api/v1/competitions/${competition.id}/runners`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        firstName: "Zaid",
        lastName: "Awiss",
        email: "zaid@example.com",
        club: "Backyard Runners",
      }),
    });

    assert.equal(runnerResponse.status, 201);
    const runner = await runnerResponse.json();
    assert.equal(runner.competitionId, competition.id);
    assert.equal(runner.firstName, "Zaid");
  });

  it("returns a clear validation error when competition start time is missing", async () => {
    const loginResponse = await request("/api/v1/organizers/login", {
      method: "POST",
      body: JSON.stringify({
        email: "arrangor@example.com",
        password: "password123",
      }),
    });
    const sessionCookie = getSessionCookie(loginResponse);

    const response = await request("/api/v1/competitions", {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        name: "Trasig tävling",
        type: "Backyard Ultra",
        place: "Göteborg",
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error.code, "BAD_REQUEST");
  });

  it("can filter competitions by date, type, organizer and place", async () => {
    const response = await request(
      `/api/v1/competitions?date=2026-06-13&type=backyard&organizerId=${seededOrganizerId}&place=ume`,
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].id, seededCompetitionId);
    assert.equal(body[0].name, "Skogsgläntans Backyard Ultra");
  });

  it("lets a runner create an account, log in and register for a competition", async () => {
    const registerResponse = await request("/api/v1/runners/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Sara",
        lastName: "Lind",
        email: "sara@example.com",
        password: "password123",
        club: "Skogslöparna",
      }),
    });

    assert.equal(registerResponse.status, 201);

    const loginResponse = await request("/api/v1/runners/login", {
      method: "POST",
      body: JSON.stringify({
        email: "sara@example.com",
        password: "password123",
      }),
    });

    assert.equal(loginResponse.status, 200);
    const sessionCookie = getSessionCookie(loginResponse);

    const registrationResponse = await request(`/api/v1/competitions/${seededCompetitionId}/runners/me`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(registrationResponse.status, 201);
    const registration = await registrationResponse.json();
    assert.equal(registration.competitionId, seededCompetitionId);
    assert.equal(registration.email, "sara@example.com");
  });

  it("lets a user export data, schedule deletion and cancel it by logging in", async () => {
    const registerResponse = await request("/api/v1/runners/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: "Export",
        lastName: "Person",
        email: "export@example.com",
        password: "password123",
        club: "Dataklubben",
      }),
    });

    assert.equal(registerResponse.status, 201);
    const sessionCookie = getSessionCookie(registerResponse);

    const exportResponse = await request("/api/v1/auth/me/export", {
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(exportResponse.status, 200);
    const exportedData = await exportResponse.json();
    assert.equal(exportedData.user.email, "export@example.com");
    assert.ok(Array.isArray(exportedData.runnerRegistrations));

    const deleteResponse = await request("/api/v1/auth/me", {
      method: "DELETE",
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(deleteResponse.status, 202);
    const deleteBody = await deleteResponse.json();
    assert.ok(deleteBody.deletionScheduledAt);

    const pendingUser = await UserModel.findOne({ email: "export@example.com" });
    assert.ok(pendingUser?.deletionScheduledAt);
    assert.equal(pendingUser.deletedAt, null);

    const currentSessionResponse = await request("/api/v1/auth/me", {
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(currentSessionResponse.status, 401);

    const loginResponse = await request("/api/v1/runners/login", {
      method: "POST",
      body: JSON.stringify({
        email: "export@example.com",
        password: "password123",
      }),
    });

    assert.equal(loginResponse.status, 200);

    const restoredUser = await UserModel.findOne({ email: "export@example.com" });
    assert.equal(restoredUser?.deletionScheduledAt, null);
    assert.equal(restoredUser?.deletionRequestedAt, null);
  });

  it("keeps historical runner names when account deletion is finalized", async () => {
    const runnerAccount = await UserModel.create({
      firstName: "Historisk",
      lastName: "Löpare",
      email: "historisk@example.com",
      roles: ["user", "runner"],
      passwordHash: await hashPassword("password123"),
    });

    const runner = await RunnerModel.create({
      competitionId: seededCompetitionId,
      runnerAccountId: runnerAccount._id,
      firstName: "Historisk",
      lastName: "Löpare",
      email: "historisk@example.com",
      club: "Gamla Klubben",
      lapTimes: [3599],
    });

    runnerAccount.deletionRequestedAt = new Date("2026-01-01T00:00:00.000Z");
    runnerAccount.deletionScheduledAt = new Date("2026-01-31T00:00:00.000Z");
    await runnerAccount.save();

    const loginResponse = await request("/api/v1/runners/login", {
      method: "POST",
      body: JSON.stringify({
        email: "historisk@example.com",
        password: "password123",
      }),
    });

    assert.equal(loginResponse.status, 410);

    const historicalRunner = await RunnerModel.findById(runner.id);

    assert.equal(historicalRunner?.firstName, "Historisk");
    assert.equal(historicalRunner?.lastName, "Löpare");
    assert.equal(historicalRunner?.email, null);
    assert.equal(historicalRunner?.runnerAccountId, null);
    assert.deepEqual(historicalRunner?.lapTimes, [3599]);
  });

  it("lets a timekeeper report lap times but not add or delete runners", async () => {
    await UserModel.create({
      firstName: "Tim",
      lastName: "Tidtagare",
      email: "tidtagare@example.com",
      roles: ["user", "runner", "timekeeper"],
      passwordHash: await hashPassword("password123"),
    });

    const runner = await RunnerModel.create({
      competitionId: seededCompetitionId,
      firstName: "Nora",
      lastName: "Nilsson",
      email: "nora@example.com",
      club: "Tidklubben",
    });

    const loginResponse = await request("/api/v1/runners/login", {
      method: "POST",
      body: JSON.stringify({
        email: "tidtagare@example.com",
        password: "password123",
      }),
    });

    assert.equal(loginResponse.status, 200);
    const sessionCookie = getSessionCookie(loginResponse);

    const currentSessionResponse = await request("/api/v1/auth/me", {
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(currentSessionResponse.status, 200);
    const currentSession = await currentSessionResponse.json();
    assert.ok(currentSession.user.roles.includes("timekeeper"));

    const lapTimesResponse = await request(`/api/v1/runners/${runner.id}/lap-times`, {
      method: "PATCH",
      headers: {
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        lapTimes: [3598, 3602],
      }),
    });

    assert.equal(lapTimesResponse.status, 200);
    const updatedRunner = await lapTimesResponse.json();
    assert.deepEqual(updatedRunner.lapTimes, [3598, 3602]);

    const addRunnerResponse = await request(`/api/v1/competitions/${seededCompetitionId}/runners`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        firstName: "Otto",
        lastName: "Olsson",
        email: "otto@example.com",
      }),
    });

    assert.equal(addRunnerResponse.status, 403);

    const deleteRunnerResponse = await request(`/api/v1/runners/${runner.id}`, {
      method: "DELETE",
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert.equal(deleteRunnerResponse.status, 403);
  });
});
