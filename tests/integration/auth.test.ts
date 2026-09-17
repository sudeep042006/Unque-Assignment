import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/User.js';

describe('Auth Endpoints Integration Tests', () => {
  const testUser = {
    name: 'Test Customer',
    email: 'authtest@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salon-db-test');
    }
  });

  beforeEach(async () => {
    await User.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully with HTTP 201', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should return HTTP 400 when registering with an existing email', async () => {
      await request(app).post('/api/register').send(testUser);

      const res = await request(app)
        .post('/api/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email already in use');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully and return JWT token with HTTP 200', async () => {
      await request(app).post('/api/register').send(testUser);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('role', 'customer');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return HTTP 400 for incorrect password', async () => {
      await request(app).post('/api/register').send(testUser);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return HTTP 400 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
