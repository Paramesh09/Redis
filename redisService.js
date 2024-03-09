const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (error) => {
  console.error('Redis client error:', error);
});

module.exports = redisClient;