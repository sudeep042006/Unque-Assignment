import express from 'express';
import { getAvailableSlots } from '../controllers/salonController.js';

const router = express.Router();

router.get('/salons/:salonId/available-slots', getAvailableSlots);

export default router;
