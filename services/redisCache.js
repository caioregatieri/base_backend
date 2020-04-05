'use strict'

const { promisify } = require('util');

const redisClient = require('../config/redis');

let connected = false;

redisClient.on('connect', function() {
    connected = true;
});

redisClient.on('error', () => {
    connected = false
});

async function Cache(key, fn, ttl = 60) {
    try {
        if (!connected) {
            return await fn();
        }
            
        const cached = await checkRedisCache(key)

        if (!cached) {
            const setAsync = promisify(redisClient.set).bind(redisClient);
            const expireAsync = promisify(redisClient.expire).bind(redisClient);
    
            const value = await fn();
    
            await setAsync(key, JSON.stringify(value));
            await expireAsync(key, ttl);
    
            return value;
        } 

        return JSON.parse(cached);
    } catch (error) {
        throw(error)
    }
}

async function Clear(key) {
    try {
        const delAsync = promisify(redisClient.del).bind(redisClient);
        await delAsync(key);
    } catch (error) {
        throw(error);
    }
}

async function checkRedisCache(key){
    const getAsync = promisify(redisClient.get).bind(redisClient);
    return await getAsync(key);
}

async function showAllKeys(key){
    const { promisify } = require('util');
    const keysAsync = promisify(redisClient.keys).bind(redisClient);
    const result = await keysAsync(key);
    return result;
}

module.exports = {
    Cache,
    Clear
}