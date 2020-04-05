const baseRepository = require('../repositories/_base');

class BaseController {
    
    constructor(model) {
        this.repository = new baseRepository(model);
    }

    async index(req, res) {
        try {
            const result = await this.repository.index({ ...this.model }, req);
            res.send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }

    async show(req, res) {
        try {
            const { Primarykey } = this.model;
            const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
            const result = await this.repository.show(Model, indentify);
            res.send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }

    async create(req, res) {
        try {
            const { Model, Schema } = this.model;
            const result = await this.repository.create(Model, await Base.makeObjToSave(Schema, req.body));
            res.send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }

    async update(req, res) {
        try {
            const { Model, Schema, Primarykey } = this.model;
            const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
            const result = await this.repository.update(Model, indentify, await Base.makeObjToSave(Schema, req.body));
            res.send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    };

    async delete(req, res) {
        try {
            const { Model, Primarykey } = this.model;
            const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
            const result = await this.repository.delete(Model, indentify)
            res.status(204).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
}

module.exports = BaseController;