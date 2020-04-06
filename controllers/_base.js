'use strict'
const baseRepository = require('../repositories/_base');
class BaseController {
    
    constructor(model) {
        this.repository = new baseRepository(model);

        this.index  = this.index.bind(this);
        this.show   = this.show.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async index(req, res) {
        try {
            const result = await this.repository.index(req.query);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async show(req, res) {
        try {
            const indentify = {id: req.params.id};
            const result = await this.repository.show(indentify, req.query);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async create(req, res) {
        try {
            const result = await this.repository.create(req.body);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    }

    async update(req, res) {
        try {
            const indentify = {id: req.params.id};
            const result = await this.repository.update(indentify, req.body);
            res.send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    async delete(req, res) {
        try {
            const indentify = {id: req.params.id};
            const result = await this.repository.delete(indentify)
            res.status(204).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

module.exports = BaseController;