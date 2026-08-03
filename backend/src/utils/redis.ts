import redis from 'redis';

export const getRedisClient = (url: string) => {
  return redis.createClient({ url });
};
