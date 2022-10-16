const NeedAuth = 'Необходима авторизация';
const ServerError = 'На сервере произошла ошибка';
const UrlError = 'Введите корректный URL';
const LoginPasswordError = 'Неправильные почта или пароль';
const EmaiError = 'Введите корректный адрес электронной почты';

// movie constants
const MovieBadDataError = 'Переданы некорректные данные при создании фильма';
const NoPermissionError = 'Нет прав для данной операции';
const MovieRemoved = 'Фильм удалён';
const MovieIdError = 'Передан несуществующий _id фильма';

// user constants
const UserIdExists = 'Пользователь по указанному _id не найден';
const UserIdError = 'Некорекктный _id пользователя';
const UserBadDataError = 'Переданы некорректные данные при обновлении профиля';
const UserEmailExists = 'Пользователь с таким email уже существует';

module.exports = {
  NeedAuth,
  ServerError,
  UrlError,
  LoginPasswordError,
  EmaiError,
  MovieBadDataError,
  NoPermissionError,
  MovieRemoved,
  MovieIdError,
  UserIdExists,
  UserIdError,
  UserBadDataError,
  UserEmailExists,
};
