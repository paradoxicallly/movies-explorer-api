const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const { errors, Joi, celebrate } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/errorsHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const NotFoundError = require('./errors/not-found-error');
const { mongoDbAddress } = require('./mongo-express-config');

const { PORT = 4000, DB_ADDRESS, NODE_ENV } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(NODE_ENV === 'production' ? DB_ADDRESS : mongoDbAddress, {});
mongoose.set('toObject', { useProjection: true });
mongoose.set('toJSON', { useProjection: true });

// логирование запросов
app.use(requestLogger);

// работа с CORS
app.use(cors());

// лимитирование запросов
app.use(rateLimiter);

// роуты, не требующие авторизации
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

// авторизация
app.use(auth);

// роуты, которым авторизация нужна
app.use('/movies', require('./routes/movies'));
app.use('/users', require('./routes/users'));

// обработка роутов
app.use('*', (req, res, next) => {
  next(new NotFoundError('Роут не найден'));
});

// логирование ошибок
app.use(errorLogger);

// обработчик ошибок celebrate
app.use(errors());

// обработка ошибок
app.use(errorsHandler);

app.listen(PORT, () => {});
