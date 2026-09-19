import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import Salon from '../../models/Salon.js';
import Service from '../../models/Service.js';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
/* import salonService from '../../controllers/salonController.js'; */
import salonRoutes from '../../routes/salonRoutes.js';

describe('GET /api/salons/:salonId/available-slots', () => {
  beforeAll(async () => {
    if( mongoose.connection.readyState === 0){
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

  it('should display the available', async () => {

    const salon = await Salon.create({
      name: 'Test Salon',
      openTime: '9:00',
      closeTime: '17:30',
      location: 'Test Location'
    });

    const service = await Service.create({
      name: 'HairCut',
      duration: 30,
      price: 250,
      salonId: salon._id

    });

    const stylist = await User.create({
      name: 'Test Stylist',
      email: 'stylist@test.com',
      password: 'hashedpassword',
      role: 'stylist'
    })

    const booking = await Booking.create({
      salonId: salon._id,
      stylistId: stylist._id,
      customerId: stylist._id,
      serviceId: service._id,
      date:'2026-10-10',
      startTime: '10:00',
      endTime: '10:30',
      status: 'booked'
    })
     

  

    const res = await request(app).get(`/api/salons/${salon._id}/available-slots?date=2026-10-10&serviceId=${service._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('availableSlots');
    
    expect(Array.isArray(res.body.availableSlots)).toBe(true);

    expect(res.body.availableSlots.length).toBeGreaterThan(0);
  });


})
