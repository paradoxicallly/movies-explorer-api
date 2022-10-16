const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const NoPermission = require('../errors/no-permission');
const {
  MovieBadDataError,
  NoPermissionError,
  MovieRemoved,
  MovieIdError,
} = require('../constants/constants');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .populate('owner')
    .then((movies) => {
      const userMovies = movies.filter((movie) => movie.owner._id.toString() === req.user._id);
      res.send({ data: userMovies });
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(MovieBadDataError));
        return;
      }
      next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        next(new NoPermission(NoPermissionError));
      } else {
        Movie.findByIdAndRemove(req.params.movieId)
          .then(() => {
            res.send({ message: MovieRemoved });
          })
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        next(new NotFoundError(MovieIdError));
        return;
      }
      next(err);
    });
};
