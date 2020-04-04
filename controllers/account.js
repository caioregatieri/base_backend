'use strict'

const asyncFunction = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { Model, Schema } = require('../models/User');

function generateToken(user) {
  const payload = {
    user_id: user.id,
    created_at: moment().unix(),
    expires_at: moment().add(process.env.JWT_EXPIRES_HOURS || 2, 'hours').unix()
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET);
}

/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

/**
 * POST /login - ok
 * Sign in with email and password
 */
exports.loginPost = async function(req, res, next) {
  req.assert('email', 'E-mail inválido').isEmail();
  req.assert('email', 'Preencha o campo e-mail').notEmpty();
  req.assert('password', 'Preencha o campo senha').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const user = await (new Model({ email: req.body.email }).fetch());
  if (!user) {
    return res.status(401).send({ msg: 'E-mail ou senha inválidos'});
  }
  user.comparePassword(req.body.password, function(err, isMatch) {
    if (!isMatch) {
      return res.status(401).send({ msg: 'E-mail ou senha inválidos' });
    }
    res.send({ token: generateToken(user), user: user.toJSON() });
  });
};

/**
 * POST /signup - ok
 */
exports.signupPost = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  new Model(makeObjToSave(req)).save()
    .then(function(user) {
        res.send({ token: generateToken(user), user: user });
    })
    .catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        return res.status(400).send({ msg: 'O e-mail informado já está vinculado a outra conta.' });
      }
    });
};


/**
 * POST /forgot
 */
exports.forgotPost = async function(req, res, next) {
  req.assert('email', 'E-mail inválido').isEmail();
  req.assert('email', 'E-mail não informado').notEmpty();
  // req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const Base = require('./_base');
  const Model = require('../models/User');
  const Relateds = [];
  const Primarykey = 'id';
  const reqs = {
      query: {
          email: req.body.email,
      }
  };
  const users = await Base.get(Model, Primarykey, Relateds, reqs);
  if (users.length) {
    const user = users[0];
    const { promisify } = require('util');
    const randomBytes = promisify(crypto.randomBytes);
    const buffer = await randomBytes(8);
    const novaSenha = buffer.toString('hex').substr(0, 8);
    user.password = novaSenha;
    const indentify = {id: user.id};
    await Base.update(Model, indentify, user);

    const emailService = require('../services/email');
    const message = {
        from:    process.env['SMTP_USER'],
        to:      users[0].email,
        subject: `Recuperação de senha ${process.env.APP}`,
        text:    `Uma solicitação de recuperação senha foi efetuada, sua senha temporária é ${novaSenha}`,
    };

    const smtpConfig = {
        service: process.env['SMTP_SERVICE'],
        host:    process.env['SMTP_HOST'],
        port:    process.env['SMTP_PORT'],
        secure:  process.env['SMTP_SECURE'],
        user:    process.env['SMTP_USER'],
        pass:    process.env['SMTP_PASS'],
    };

    await emailService.sendMail(message, smtpConfig);

    res.send({
      msg: `Uma mensagem com a senha temporaria foi enviada para o email ${req.body.email}`
    });
  } else {
    res.status(404).send({
      msg: 'E-mail não encontrado'
    });
  }
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
      return res.status(400).send(errors);
  }

  asyncFunction.waterfall([
    function(done) {
      new User({ passwordResetToken: req.params.token })
        .where('passwordResetExpires', '>', new Date())
        .fetch()
        .then(function(user) {
          if (!user) {
          return res.status(400).send({ msg: 'O token de validação é inválido ou foi expirado.' });
          }
          user.set('password', req.body.password);
          user.set('passwordResetToken', null);
          user.set('passwordResetExpires', null);
          user.save(user.changed, { patch: true }).then(function(err) {
            done(err, user.toJSON());
          });
        });
    },
    function(user, done) {
      const transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD
        }
      });
      const mailOptions = {
        from: 'contato@maviclick.com',
        to: user.email,
        subject: 'Sua senha foi alterada - MavíClick',
        text: 'Olá,\n\n' +
        'Esta é a confirmação que a senha para ' + user.email + ' foi alterada.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        console.log({ msg: 'Your password has been changed successfully.' });
        res.send({ msg: 'Sua senha foi alterada com sucesso.' });
      });
    }
  ]);
};

async function makeObjToSave(req){
  Schema.foreach((column) => {
      if (req.body[column]) obj[column] = req.body[column];
  })
  return obj;
}