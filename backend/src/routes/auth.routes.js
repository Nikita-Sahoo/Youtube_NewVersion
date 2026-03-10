import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

export default router;