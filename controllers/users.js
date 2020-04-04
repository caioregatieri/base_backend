'use strict'

const Base = require('./_base');
const ModelName = 'User';
const { Model, Primarykey, Schema, Relations } = require('../models/' + ModelName);
const { Cache } = require('../services/redisCache');

exports.index = async function(req, res) {
    try {
        const result = await Cache(req.originalUrl, async () => {
            return await Base.index({ Model, Schema, Primarykey, Relations }, req);
        }); 
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.show = async function(req, res) {
    try {
        const result = await Cache(req.originalUrl, async () => {
            const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
            return await Base.show(Model, indentify);
        }); 
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.create = async function(req, res) {
    try {
        const result = await Base.create(Model, await Base.makeObjToSave(Schema, req.body));
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.update = async function(req, res) {
    try {
        const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
        const result = await Base.update(Model, indentify, await Base.makeObjToSave(Schema, req.body));
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.delete = async function(req, res) {
    try {
        const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
        const result = await Base.delete(Model, indentify)
        res.status(204).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};