const baseRepository = require('../repositories/_base');
class BaseController {
    
    constructor(model) {
        this.model = model;
    }

    async index(req, res) {
        res.send('index ' + this.model);
    }

    async show(req, res) {
        res.send('show ');
    }

    async create(req, res) {
        res.send('create ');
    }

    async update(req, res) {
        res.send('update ');
    }

    async delete(req, res) {
        res.send('delete ');
    }
}

module.exports = BaseController;