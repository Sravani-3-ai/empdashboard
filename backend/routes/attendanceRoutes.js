import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', attendanceController.getAllAttendance);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

export default router;
