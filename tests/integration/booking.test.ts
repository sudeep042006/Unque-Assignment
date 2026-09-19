import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../index.js";
import Salon from "../../models/Salon.js";
import Service from "../../models/Service.js";
import Booking from "../../models/Booking.js";
import User from "../../models/User.js";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";

import { getAuthToken } from "../helpers/authHelper.js";

describe("POST /api/bookings", () => {
  /* beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salon-db-test');
    }
  }); */

  beforeAll(async () => await connectTestDB());

  /*  beforeEach(async () => {
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
  }); */

  beforeEach(async () => await clearTestDB());

  /*  afterAll(async () => {
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await mongoose.connection.close();
  }); */

  afterAll(async () => await closeTestDB());

  it("should create booking successfully with HTTP 201", async () => {
    /* await request(app).post('/api/register').send({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'password123'
  });

  const loginRes = await request(app).post('/api/login').send({
    email: 'customer@example.com',
    password: 'password123'
  });

  const token = loginRes.body.token; */

    const { token } = await getAuthToken();

    const salonId = new mongoose.Types.ObjectId();

    const service = await Service.create({
      name: "Haircut",
      duration: 30,
      price: 50,
      salonId: salonId,
    });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        salonId: salonId.toString(),
        stylistId: new mongoose.Types.ObjectId().toString(),
        serviceId: service._id.toString(),
        slotTime: "12:00",
        date: "2026-09-18",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Booking created successfully");

    const bookingId = res.body.booking._id;

    const cancelRes = await request(app)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(cancelRes.status).toBe(200);
  });

  // negative test cases
  it("should return 401 when no token is provided", async () => {
    const res = await request(app).post("/api/bookings").send({});
    expect(res.status).toBe(401);
  });

  it("should return 400 when booking an already booked time slot", async () => {
    const { token } = await getAuthToken();
    const salonId = new mongoose.Types.ObjectId();
    const stylistId = new mongoose.Types.ObjectId();

    const service = await Service.create({
      name: "Haircut",
      duration: 30,
      price: 50,
      salonId,
    });

    await Booking.create({
      salonId,
      stylistId,
      customerId: new mongoose.Types.ObjectId(),
      serviceId: service._id,
      date: "2026-09-18",
      startTime: "12:00",
      endTime: "12:30",
      status: "booked",
    });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        salonId: salonId.toString(),
        stylistId: stylistId.toString(),
        serviceId: service._id.toString(),
        slotTime: "12:00",
        date: "2026-09-18",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Time slot is no longer available",
    );
  });

  it("should return 403 when cancelling another user's booking", async () => {
    const { token: token1 } = await getAuthToken(
      "user1@test.com",
      "password123",
    );
    const { token: token2 } = await getAuthToken(
      "user2@test.com",
      "password123",
    );

    const salonId = new mongoose.Types.ObjectId();
    const service = await Service.create({
      name: "Haircut",
      duration: 30,
      price: 50,
      salonId,
    });

    const bookRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        salonId: salonId.toString(),
        stylistId: new mongoose.Types.ObjectId().toString(),
        serviceId: service._id.toString(),
        slotTime: "14:00",
        date: "2026-09-18",
      });

    const bookingId = bookRes.body.booking._id;

    const cancelRes = await request(app)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${token2}`);

    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body).toHaveProperty(
      "error",
      "Not authorized to cancel this booking",
    );
  });
});
