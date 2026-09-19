import request from 'supertest';
import app from '../../index.js';


export const getAuthToken = async (email = 'test@example.com', password = 'password@123', role = 'customer') => {
    await request(app).post('/api/register').send({
        name: 'test User',
        email,
        password,
        role
    });

    const res = await request(app).post('/api/login').send({
        email,
        password
    });

    let token = res.body.token;
    let user = res.body;

    return {token, user};

};