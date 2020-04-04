'use strict'

async function get(lat, lng) {
    try {
        const axios = require('axios');
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C%20${lng}&key=${process.env.OPENCAGE_API_KEY}&language=pt&pretty=1`;
        const result = await axios.get(url);
        return result.data;
    } catch (error) {
        throw error
    }
}

module.exports = {
    get
}