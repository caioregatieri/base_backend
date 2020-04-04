'use strict'

const redis = require('redis');
const redisClient = redis.createClient();

//
redisClient.on('connect', function() {
    console.log('> REDIS CONECTADO.');
});

// Print redis errors to the console
redisClient.on('error', (err) => {
    console.log("> REDIS ERROR: " + err);
});

module.exports = async function(req, res, next) {
    // console.log(await showAllKeys('*'));
    var cache = await checkRedisCache(req.originalUrl);
    // console.log(req.originalUrl);
    // console.log(cache);
    if (cache) {
        console.log('> ENVIANDO RESPOSTA DO REDIS.');
        return res.send(JSON.parse(cache));
    }
    req.redis = redisClient;
    next();
}

async function checkRedisCache(key){
    const { promisify } = require('util');
    const getAsync = promisify(redisClient.get).bind(redisClient);
    const result = await getAsync(key);
    return result;
}

async function showAllKeys(key){
    const { promisify } = require('util');
    const keysAsync = promisify(redisClient.keys).bind(redisClient);
    const result = await keysAsync(key);
    return result;
}