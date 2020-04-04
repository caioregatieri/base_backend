'use strict'
const redis = require('redis');

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient(port, host);

module.exports = redisClient;