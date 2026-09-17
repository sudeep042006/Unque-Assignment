import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index.js';
import Salon from '../../models/Salon.js';
import Service from '../../models/Service.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';

describe('POST /api/bookings', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salon-db-test');
    }
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create booking successfully with HTTP 201', async () => {
  await request(app).post('/api/register').send({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'password123'
  });

  const loginRes = await request(app).post('/api/login').send({
    email: 'customer@example.com',
    password: 'password123'
  });
  const token = loginRes.body.token;


  const salonId = new mongoose.Types.ObjectId();


  const service = await Service.create({
    name: 'Haircut',
    duration: 30,
    price: 50,
    salonId: salonId
  });

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      salonId: salonId.toString(),
      stylistId: new mongoose.Types.ObjectId().toString(),
      serviceId: service._id.toString(),
      slotTime: '12:00',
      date: '2026-09-18'
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Booking created successfully');
  });
});
