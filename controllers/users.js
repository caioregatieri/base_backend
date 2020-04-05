'use strict'
const BaseController = require('./_base');
const Model = require('../models/User');
// const { Cache } = require('../services/redisCache');

class User extends BaseController {

    constructor() {
        super(Model);
    }

}

module.exports = new User();