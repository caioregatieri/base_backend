'use strict'

const Base = require('./_base');
const ModelName = 'User';
const { Model, Primarykey, Schema, Relations } = require('../models/' + ModelName);

exports.index = async function(req, res) {
    try {
        const result = await Base.index({ Model, Schema, Primarykey, Relations }, req)
        if (process.env.REDIS_CACHE && Boolean(process.env.REDIS_CACHE == 'true')) {
            req.redis.set(req.originalUrl, JSON.stringify(result));
        }
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.create = async function(req, res) {
    try {
        const result = await Base.create(Model, await makeObjToSave(req))
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

exports.update = async function(req, res) {
    try {
        const indentify = Primarykey ? {[Primarykey]: req.params[Primarykey]} : {id: req.params.id};
        const result = await Base.update(Model, indentify, await makeObjToSave(req))
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
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

async function makeObjToSave(req){
    Schema.foreach((column) => {
        if (req.body[column]) obj[column] = req.body[column];
    })
    return obj;
}