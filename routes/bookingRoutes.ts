import express from 'express';
import { createBooking, cancelBooking } from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/bookings', authMiddleware, createBooking);
router.post('/bookings/:bookingId/cancel', authMiddleware, cancelBooking);

export default router;
