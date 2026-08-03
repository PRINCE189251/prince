import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

// Simple in-memory user store for scaffold. Replace with Mongo models.
const users: any[] = [];

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const existing = users.find((u) => u.email === email);
    if (existing) return res.status(400).json({ error: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, email, password: hashed };
    users.push(user);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  }
);

router.post('/login', body('email').isEmail(), async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
  res.json({ token, user: { id: user.id, email: user.email } });
});

export default () => router;
