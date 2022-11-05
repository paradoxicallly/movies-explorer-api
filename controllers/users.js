const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictDataError = require('../errors/conflict-data-error');
const AuthError = require('../errors/auth-error');
const {
  UserIdExists,
  UserIdError,
  UserBadDataError,
  UserEmailExists,
  LoginPasswordError,
} = require('../constants/constants');

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.patchProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError(UserIdExists);
      } else res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(UserIdError));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError(UserBadDataError));
        return;
      }
      if (err.code === 11000) {
        next(new ConflictDataError(UserEmailExists));
        return;
      }
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then((user) => res.send({ user }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequestError(err.message));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictDataError(UserEmailExists));
            return;
          }
          next(err);
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
    // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        {
          expiresIn: '7 days',
        },
      );
      // вернём токен
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new AuthError(LoginPasswordError));
        return;
      }
      next(err);
    });
};
