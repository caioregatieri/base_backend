'use strict'

const crypto = require('crypto');
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
exports.loginPost = async function(req, res) {
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
exports.signupPost = async function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  try {
    const user = await new Model(await Base.makeObjToSave(Schema, req)).save();
    res.send({ token: generateToken(user), user });
  } catch (error) {
    if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
      return res.status(400).send({ msg: 'O e-mail informado já está vinculado a outra conta.' });
    }
  }
};

/**
 * POST /forgot
 */
exports.forgotPost = async function(req, res) {
  req.assert('email', 'E-mail inválido').isEmail();
  req.assert('email', 'E-mail não informado').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const Base = require('./_base');
  const { Model } = require('../models/User');

  let indentify = {email: req.body.email};
  const user = await Base.show(Model, indentify);

  if (!user) {
    return res.status(404).send({message: `email ${req.body.email} found`});
  }

  const { promisify } = require('util');
  const randomBytes = promisify(crypto.randomBytes);
  const buffer = await randomBytes(8);
  const novaSenha = buffer.toString('hex').substr(0, 8);
  await Base.update(Model, {id: user.id}, {...user, password: novaSenha});

  const emailService = require('../services/email');

  const options = {
      to:      user.email,
      subject: `Recuperação de senha ${process.env.APP}`,
      text:    `Uma solicitação de recuperação senha foi efetuada, sua senha temporária é ${novaSenha}`,
  };

  await emailService.send(options);

  res.send({
    msg: `Uma mensagem com a senha temporaria foi enviada para o e-mail ${req.body.email}`
  });
};

/**
 * POST /reset
 */
exports.resetPost = async function(req, res) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  const model = new Model({ passwordResetToken: req.params.token });
  model.where('passwordResetExpires', '>', new Date());

  const user = await model.fetch();
  if (!user) {
    return res.status(400).send({ msg: 'O token de validação é inválido ou foi expirado.' });
  }

  user.set('password', req.body.password);
  user.set('passwordResetToken', null);
  user.set('passwordResetExpires', null);
  await user.save(user.changed, { patch: true });

  const emailService = require('../services/email');

  const options = {
    to:      user.email,
    subject: `Recuperação de senha ${process.env.APP}`,
    text:    `Olá,\n\nEsta é a confirmação que a senha para ${user.email} foi alterada.\n`,
};

await emailService.send(options);


  res.status(204).end();
};