'use strict'

const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const router = express.Router();

module.exports = function(exceptions){
    const { Model } = require('./../models/User');

    // console.log(exceptions);

    router.use(async function(req, res, next) {
        let exit = false;

        if (req.originalUrl.indexOf('/api/') < 0 ) {
            exit = true;
        } else {
            exceptions.forEach(element => {
                if(req.originalUrl.indexOf(element.route) >= 0 && req.method.toUpperCase() == element.method.toUpperCase()) {
                    exit = true;
                }
            });
        }

        if(exit == true) {
            return next();     
        }

        async function verifyToken(token) {
            const { promisify } = require('util');
            const verify = promisify(jwt.verify);
            return await verify(token, process.env.TOKEN_SECRET);
        }

        req.isAuthenticated = async function() {
            const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || null;
            try {
                const payload = await verifyToken(token);
                // console.log(payload);
                return payload.expires_at >= moment().unix();
            } catch (err) {
                return false;
            }
        };

        if (await req.isAuthenticated()) {
            const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || null;
            const payload = await verifyToken(token);
            const user = await (new Model({ id: payload.user_id }).fetch())
            req.user = user;
            next();
        } else {
            if(exit == true) {
                return next();
            }
            res.status(401).send({
                msg: "Usuário não autenticado."
            });
        }

    });

    return router;
};