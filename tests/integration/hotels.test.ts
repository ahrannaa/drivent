import app, { init } from "@/app";
import { prisma } from "@/config";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createUser, createhAddressWithCEP, createTicketType, createTicket } from "../factories";
import { TicketStatus } from "@prisma/client";
import { createHotel } from "../factories/hotels-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => { 
  it("should respond with status 401 if no token", async () => {
    const result = await server.get("/hotels");
    
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if invalid token", async () => {
    const result = await server.get("/hotels").set("Authorization", "Bearer XXXX");
    
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 200 and empty array if valid token", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token} `);
    
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual([]);
  });

  it("should respond with status 200 and hotels if valid token", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const hotel1 = await createHotel();
    const hotel2 = await createHotel();

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token} `);
    
    expect(result.status).toBe(httpStatus.OK);
    expect(result.body).toEqual([
      {
        id: hotel1.id,
        name: hotel1.name,
        image: hotel1.image,
        createdAt: hotel1.createdAt.toISOString(),
        updatedAt: hotel1.updatedAt.toISOString(),
      },
      {
        id: hotel2.id,
        name: hotel2.name,
        image: hotel2.image,
        createdAt: hotel2.createdAt.toISOString(),
        updatedAt: hotel2.updatedAt.toISOString(),
      },
    ]);
  });
  
  it("should respond with status 404 if there is no enrollment", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.NOT_FOUND);
    expect(result.text).toBe("Enrollment not found!!");
  });

  it("should respond with status 404 if there is no ticket", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);
    await createTicketType(true);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.NOT_FOUND);
    expect(result.text).toBe("Ticket not found!!");
  });

  it("should respond with status 402 when ticket status equals RESERVED", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when ticket type no includes hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
}
);
