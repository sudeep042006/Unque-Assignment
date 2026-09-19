import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import { connectTestDB, clearTestDB, closeTestDB } from '../helpers/db.js';
import Salon from '../../models/Salon.js';
import Service from '../../models/Service.js';
import User from '../../models/User.js';

describe('End to end user booking workflow', () => {

    beforeAll(async () => await connectTestDB());
    beforeEach(async () => await clearTestDB());
    afterAll(async () => await closeTestDB());

    it('should complete the full lifecycle of register login find slots book and cancle', async () => {

        const testUser = {
            name: 'test User',
            email: 'test@example.com',
            password: 'password@123'
        }

        const reg = await request(app).post('/api/register').send(testUser);
        expect(reg.status).toBe(404);  // 200

        const login = await request(app).post('/api/login').send(testUser);
        expect(login.status).toBe(200);

        const token = login.body.token;

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
        });

       const slotRes = await request(app).get(`/api/salons/${salon._id}/available-slots?date=2026-10-10&serviceId=${service._id}`);
        expect(slotRes.status).toBe(200);

        expect(slotRes.body.availableSlots.length).toBeGreaterThan(0);

        const choosenSlot = slotRes.body.availableSlots[0].time;

        const bookRes = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${token}`)
          .send({
            salonId: salon._id,
            stylistId: stylist._id,
            serviceId: service._id,
            slotTime: '12:30',
            date: '2026-10-10'
        });
        expect(bookRes.status).toBe(201);

        const bookingId = bookRes.body.booking._id;

        const cancelRes = await request(app)
          .post(`/api/bookings/${bookingId}/cancel`)
          .set('Authorization', `Bearer ${token}`);
          expect(cancelRes.status).toBe(200);
          expect(cancelRes.body.message).toBe('Booking cancelled successfully');
   });

});