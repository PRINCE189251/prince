import { Router } from 'express';
import proxyRouter from './proxy';
import authRouter from './auth';

export const apiRouter = ({ redis }: { redis: any }) => {
  const router = Router();

  router.use('/proxy', proxyRouter(redis));
  router.use('/auth', authRouter());

  router.get('/health', (req, res) => res.json({ ok: true }));

  return router;
};
